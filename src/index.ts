import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { exec } from "child_process";
import minimist = require("minimist");

const { GITMSG_OPENAI_API_KEY, GITMSG_COMMIT_PROMPT, GITMSG_PR_PROMPT } = process.env;

/**
 * Executes a shell command and returns the output as a Promise. Optionally accepts stdin input.
 *
 * @function
 * @async
 * @param {string} command - The shell command to execute.
 * @param {string} [stdin] - Optional input to be passed to the command via stdin.
 * @returns {Promise<string>} - A Promise that resolves with the command's stdout output.
 */
async function execHelper(command: string, stdin?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = exec(command);
        console.log(`Running: ${command}`);
        if (stdin) {
            child.stdin?.write(stdin);
            child.stdin?.end();
        }
        let stdout = "";
        child.stdout?.on("data", (data) => {
            stdout += data;
        });
        child.on("close", (code) => {
            if (code !== 0) {
                reject();
            } else {
                resolve(stdout);
            }
        });
    });
}

async function getChatCompletion(diff: string, prompt: string) {
    const openai = new OpenAIApi(new Configuration({ apiKey: GITMSG_OPENAI_API_KEY }));
    const messages: ChatCompletionRequestMessage[] = [
        {
            role: "user",
            content: diff,
        },
        {
            role: "user",
            content: prompt,
        },
    ];
    const {
        data: {
            choices: [result],
            ...rest
        },
    } = await openai.createChatCompletion({
        model: "gpt-4",
        messages,
    });
    return { result, rest };
}

async function gitDiffBranchCommand(args?: any) {
    const branch = args.branch ? args.branch : "origin/main";
    console.log(`args.pr.length ${args.pr.length}`)
    console.log(`args.pr ${args.pr}`)
    const files = args.pr.length > 0 ? `${args.pr} ${args._}` : ".";
    return `git diff ${branch} ${files}`;
}

async function GitDiffStagedCommand() {
    return `git diff --staged`;
}

async function handleGitDiff(Command: string) {
    const diff = await execHelper(Command);
    displayDiff(diff);
    return diff;
}

async function displayDiff(diff: string) {
    if (!diff) {
        console.log("No diff found. Exiting.");
        process.exit(0);
    }
    console.log("\ndiff:\n");
    console.log(diff);
    console.log("\n--------------------\n");
    return diff;
}

async function handleGitCommit(commitMsg?: string) {
    if (!commitMsg) {
        throw new Error("No commit message from openai");
    }
    console.log("Generated Commit Message:");
    console.log(commitMsg);
    console.log("\n--------------------\n");
    await execHelper("git commit -F -", commitMsg);
    console.log(`\nIf you need to modify the commit, run gitmsg --amend\n`);
    console.log(`If you want to regenerate a new commit, run gitmsg --undo && gitmsg\n`);
}

async function handlePrDescription(pullRequestDescription?: string) {
    if (!pullRequestDescription) {
        throw new Error("No PR description from openai");
    }
    console.log("Generated Pull Request Description:");
    console.log(pullRequestDescription);
    console.log("\n--------------------\n");
}

async function handleGitAmend() {
    await execHelper("git commit --amend --no-edit");
}

async function main() {
    const args = minimist(process.argv.slice(2));
    console.log(args);
    if (args.help) {
        console.log(`
          Usage: gitmsg [options]
          
          Options:
          --help      Show this help message
          --amend     Amend the last commit
          --undo      Undo the last commit
          --pr        Generate a PR description
          --branch    The branch to compare against (default: origin/main)
          `);
        process.exit(0);
    }
    if (args.amend) {
        console.log("Running gitmsg --amend");
        await handleGitAmend();
        process.exit(0);
    }
    if (args.undo) {
        console.log("Running gitmsg --undo");
        await execHelper("git reset --soft HEAD~1");
        process.exit(0);
    }
    if (args.pr) {
        const command = await gitDiffBranchCommand(args)
        console.log(`Running ${command}}`);
        const diff = await handleGitDiff(command);
        const { result } = await getChatCompletion(diff, GITMSG_PR_PROMPT || "");
        await handlePrDescription(result.message?.content?.trim());
        process.exit(0);
    }
    console.log("Running gitmsg");
    const diff = await handleGitDiff(await GitDiffStagedCommand());
    const { result } = await getChatCompletion(diff, GITMSG_COMMIT_PROMPT || "");
    await handleGitCommit(result.message?.content?.trim());
    process.exit(0);
}

main().catch((e) => console.error(e));
