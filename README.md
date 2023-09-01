# gitmsg

- npm run build

Set these environment variables:

```
GITMSG_OPENAI_API_KEY
GITMSG_PROMPT
```

Suggested prompt:
```
'The above is the result of `git diff`. Please provide a commit message, adhering to "conventional commits" for this change. Only include the commit message text. Do not include information about commit messages or how to compose commit messages.'
```

Install gitmsg package from GitHub:

```npm install github:alismx/gitmsg```