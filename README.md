# Lark GitHub bot

[Lark][1]/[FeiShu][2] notification bot based on [GitHub actions][3], which is an Open-source alternative of the official [GitHub assistant][4] (disabled for new users in FeiShu).

[![Lark notification](https://github.com/idea2app/Lark-GitHub-bot/actions/workflows/Lark.yml/badge.svg)][5]

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][6]
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][7]

## Supported events

1. Push
2. Issues
   1. opened
   2. reopened
   3. edited
   4. transferred
   5. labeled
   6. unlabeled
   7. assigned
   8. unassigned
   9. closed
3. Pull request
   1. opened
   2. reopened
   3. edited
   4. labeled
   5. unlabeled
   6. assigned
   7. unassigned
   8. closed
4. Issue comment
   1. created
   2. edited
5. Release
   1. published

## Usage

First, create set up a repository as described below,
then set the Web hook URL of your Lark custom bot to `LARK_CHATBOT_HOOK_URL` secret variable in your GitHub repository settings.

### New repository

Click the [<kbd>Use this template</kbd>][8] button on the top of this GitHub repository's home page to create your own repository.

### Old repository

NPM compatible environment for example:

```shell
npm i pnpm -g
cd /path/to/your/git/repository/root

folders=".github/workflows .github/scripts"

for folder in $folders; do
   mkdir -p $folder
   cd $folder
   pnpx get-git-folder https://github.com/idea2app/Lark-GitHub-bot main $folder
   cd -
done
```

## Acknowledgement

- https://github.com/foxundermoon/feishu-action

[1]: https://www.larksuite.com/
[2]: https://www.feishu.cn/
[3]: https://github.com/features/actions
[4]: https://app.larksuite.com/app/cli_9c4b6daaa4bad106
[5]: https://github.com/idea2app/Lark-GitHub-bot/actions/workflows/Lark.yml
[6]: https://codespaces.new/idea2app/Lark-GitHub-bot
[7]: https://gitpod.io/?autostart=true#https://github.com/idea2app/Lark-GitHub-bot
[8]: https://github.com/new?template_name=Lark-GitHub-bot&template_owner=idea2app
