# Lark GitHub bot

[Lark][1]/[FeiShu][2] notification bot based on [GitHub actions][3], which is an Open-source alternative of the official [GitHub assistant][4] (disabled for new users in FeiShu).

[![Lark notification](https://github.com/idea2app/Lark-GitHub-bot/actions/workflows/Lark.yml/badge.svg)][5]

## Usage

### New repository

Click the [<kbd>Use this template</kbd>][6] button on the top of this GitHub repository's home page to create your own repository.

### Old repository

NPM compatible environment for example:

```shell
npm i pnpm -g
cd /path/to/your/git/repository/root
cd .github/workflows
pnpx get-git-folder https://github.com/idea2app/Lark-GitHub-bot main .github/workflows
```

[1]: https://www.larksuite.com/
[2]: https://www.feishu.cn/
[3]: https://github.com/features/actions
[4]: https://app.larksuite.com/app/cli_9c4b6daaa4bad106
[5]: https://github.com/idea2app/Lark-GitHub-bot/actions/workflows/Lark.yml
[6]: https://github.com/new?template_name=Lark-GitHub-bot&template_owner=idea2app
