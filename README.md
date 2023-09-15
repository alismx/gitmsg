# gitmsg - Installation Instructions

This guide will walk you through the steps to install a TypeScript GitHub repository that uses Node.js to run a CLI tool.

## Prerequisites
Before you begin, ensure that you have the following software installed on your machine:

- Node.js: Make sure you have Node.js installed. You can download and install it from the official website: [https://nodejs.org](https://nodejs.org)
- Git: Ensure that Git is installed on your machine. If not, you can download and install it from the official website: [https://git-scm.com](https://git-scm.com)
- OpenAI API Key: You will need an OpenAI API key to use this tool. You can get one by signing up for an account at [https://platform.openai.com/](https://platform.openai.com/). Once you have an account, you can find your API key on the [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) page.

## Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/alismx/gitmsg.git
   ```

2. Navigate to the project directory:
   ```
   cd gitmsg
   ```

3. Install dependencies by running the following command:
   ```
   npm install
   ```
   This command will install all the required dependencies listed in the `package.json` file.

4. Build the TypeScript code:
   ```
   npm run build
   ```
   This command compiles the TypeScript code into JavaScript.

5. Add `/usr/local/bin/gitmsg` file with contents:
    
    ```
    #!/bin/sh
    node ~/path/to/gitmsg/dist $1
    ```
   
6. Add these environment variables to your profile:

    ```
    GITMSG_OPENAI_API_KEY
    GITMSG_PROMPT
    ```

Suggested prompt:
```
'The above is the result of `git diff`. Please provide a commit message, adhering to "conventional commits" for this change. Only include the commit message text. Do not include information about commit messages or how to compose commit messages.'
```

If you have any issues with the installation or encounter any bugs, please [open an issue](https://github.com/alismx/gitmsg/issues/new).

## Usage

Generate a commit message based on changes in stages files and commit them:
```
gitmsg
```

Display usage information:
```
gitmsg --help
```

Amend the last commit with staged files:
```
gitmsg --amend
```

Undo the last commit:
```
gitmsg --undo
```
