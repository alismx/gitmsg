import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { exec } from "child_process";

const { GITMSG_OPENAI_API_KEY, GITMSG_PROMPT } = process.env;

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
        console.info(`Running: ${command}`);
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

async function getChatCompletion(messages: ChatCompletionRequestMessage[]) {
    const openai = new OpenAIApi(new Configuration({ apiKey: GITMSG_OPENAI_API_KEY }));
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

async function main() {
    const diff = await execHelper("git diff --staged");
    const prompt = GITMSG_PROMPT
    if (!diff) {
        console.info("No staged changes to commit");
        process.exit(0);
    } else {
        console.info("\ndiff:\n");
        console.info(diff);
        console.info("\n--------------------\n");
    }
    const response = await getChatCompletion([
        {
            role: "user",
            content: diff,
        },
        {
            role: "user",
            content: prompt
        },
    ]);
    const commitMsg = response.result.message?.content?.trim();
    if (!commitMsg) {
        throw new Error("No commit message from openai");
    }
    console.info("Commit Message:");
    console.info(commitMsg);
    console.info("\n--------------------\n");
    await execHelper("git commit -F -", commitMsg);
    console.info(`\nIf you need to modify the commit, run git commit --amend\n`);
    console.info(`If you want to regenerate a new commit, run git reset --soft HEAD~1 && gitmsg\n`);
}

main().catch((e) => console.error(e));