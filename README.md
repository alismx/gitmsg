# gitmsg

Install instuctions:

1. Clone repo
2. In repo dir run `npm run build`
3. Add `/usr/local/bin/gitmsg` file with contents:

```
#!/bin/sh
node ~/path/to/gitmsg/dist $1
```

Set these environment variables:

```
GITMSG_OPENAI_API_KEY
GITMSG_PROMPT
```

Suggested prompt:
```
'The above is the result of `git diff`. Please provide a commit message, adhering to "conventional commits" for this change. Only include the commit message text. Do not include information about commit messages or how to compose commit messages.'
```
