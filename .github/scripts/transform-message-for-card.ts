import { components } from 'npm:@octokit/openapi-types';
import { stdin } from 'npm:zx';

type GitHubSchema = components['schemas'];
type GitHubUser = GitHubSchema['simple-user'];

interface GitHubAction
  extends Record<'event_name' | 'actor' | 'server_url' | 'repository', string> {
  action?: string;
  ref?: string;
  ref_name?: string;
  event: {
    head_commit?: GitHubSchema['git-commit'];
    issue?: GitHubSchema['webhook-issues-opened']['issue'];
    pull_request?: GitHubSchema['pull-request'];
    discussion?: GitHubSchema['discussion'];
    comment?: GitHubSchema['issue-comment'];
    release?: GitHubSchema['release'];
  };
}

// Helper functions
const getActionText = (action?: string) => {
  if (!action) return '编辑';
  switch (action) {
    case 'created':
    case 'opened':
    case 'submitted':
      return '创建';
    case 'closed':
      return '关闭';
    case 'reopened':
      return '重新打开';
    case 'labeled':
      return '添加标签';
    case 'unlabeled':
      return '移除标签';
    case 'assigned':
      return '指派';
    case 'unassigned':
      return '取消指派';
    case 'edited':
      return '编辑';
    case 'deleted':
      return '删除';
    case 'synchronize':
      return '更新';
    case 'review_requested':
      return '请求审核';
    default:
      return action;
  }
};

const createLink = (href: string, text = href) => `[${text}](${href})`;

const createUserLink = (user: GitHubUser) =>
  user ? createLink(user.html_url, user.login) : '无';

// 将 GitHub markdown 转换为飞书卡片支持的格式
const sanitizeMarkdown = (text: string): string => {
  return text
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '[代码块]')
    // 移除行内代码
    .replace(/`[^`]+`/g, (match) => match.slice(1, -1))
    // 将图片转换为链接文本
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '🖼️ [$1]($2)')
    // 将 ### 标题转换为加粗
    .replace(/^###\s+(.+)$/gm, '**$1**')
    // 将 ## 标题转换为加粗
    .replace(/^##\s+(.+)$/gm, '**$1**')
    // 将 # 标题转换为加粗
    .replace(/^#\s+(.+)$/gm, '**$1**')
    // 移除 HTML 注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 移除 HTML 标签（保留内容）
    .replace(/<[^>]+>/g, '')
    // 移除多余的空行
    .replace(/\n{3,}/g, '\n\n')
    // 截断过长内容
    .slice(0, 800) + (text.length > 800 ? '\n...' : '');
};

const createContentItem = (label: string, value?: string) =>
  `**${label}** ${value ? sanitizeMarkdown(value) : '无'}`;

type EventHandler = (
  event: GitHubAction,
  actionText: string,
) => {
  title: string;
  elements: any[];
};

// Event handlers
const eventHandlers: Record<string, EventHandler> = {
  push: ({
    event: { head_commit },
    ref,
    ref_name,
    server_url,
    repository,
    actor,
  }) => {
    const commitUrl = head_commit?.url || `${server_url}/${repository}/tree/${ref_name}`;
    const commitMessage = head_commit?.message || 'Create/Delete/Update Branch (No head commit)';

    return {
      title: 'GitHub 代码提交',
      elements: [
        {
          tag: 'markdown',
          content: [
            createContentItem('提交链接：', createLink(commitUrl)),
            createContentItem('代码分支：', createLink(`${server_url}/${repository}/tree/${ref_name}`, ref_name)),
            createContentItem('提交作者：', createLink(`${server_url}/${actor}`, actor)),
            createContentItem('提交信息：', commitMessage),
          ].join('\n'),
        },
      ],
    };
  },

  issues: ({ event: { issue } }, actionText) => ({
    title: `GitHub issue ${actionText}：${issue?.title}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(issue!.html_url)),
          createContentItem('作者：', createUserLink(issue!.user!)),
          createContentItem('指派：', issue?.assignee ? createUserLink(issue.assignee) : '无'),
          createContentItem('标签：', issue?.labels?.map(({ name }) => name).join(', ') || '无'),
          createContentItem('里程碑：', issue?.milestone?.title || '无'),
          createContentItem('描述：', issue?.body || '无'),
        ].join('\n'),
      },
    ],
  }),

  pull_request: ({ event: { pull_request } }, actionText) => ({
    title: `GitHub PR ${actionText}：${pull_request?.title}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(pull_request!.html_url)),
          createContentItem('作者：', createUserLink(pull_request!.user)),
          createContentItem('指派：', pull_request?.assignee ? createUserLink(pull_request.assignee) : '无'),
          createContentItem('标签：', pull_request?.labels?.map(({ name }) => name).join(', ') || '无'),
          createContentItem('里程碑：', pull_request?.milestone?.title || '无'),
          createContentItem('描述：', pull_request?.body || '无'),
        ].join('\n'),
      },
    ],
  }),

  discussion: ({ event: { discussion } }, actionText) => ({
    title: `GitHub 讨论 ${actionText}：${discussion?.title || '无'}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(discussion!.html_url)),
          createContentItem('作者：', createUserLink(discussion!.user as GitHubUser)),
          createContentItem('描述：', discussion?.body || '无'),
        ].join('\n'),
      },
    ],
  }),

  issue_comment: ({ event: { comment, issue } }) => ({
    title: `GitHub issue 评论：${issue?.title || '未知 issue'}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(comment!.html_url)),
          createContentItem('作者：', createUserLink(comment!.user!)),
          createContentItem('描述：', comment?.body || '无'),
        ].join('\n'),
      },
    ],
  }),

  discussion_comment: ({ event: { comment, discussion } }) => ({
    title: `GitHub 讨论评论：${discussion?.title || '无'}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(comment!.html_url)),
          createContentItem('作者：', createUserLink(comment!.user!)),
          createContentItem('描述：', comment?.body || '无'),
        ].join('\n'),
      },
    ],
  }),

  release: ({ event: { release } }) => ({
    title: `GitHub Release 发布：${release!.name || release!.tag_name}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(release!.html_url)),
          createContentItem('作者：', createUserLink(release!.author)),
          createContentItem('描述：', release?.body || '无'),
        ].join('\n'),
      },
    ],
  }),

  pull_request_review_comment: ({ event: { comment, pull_request } }) => ({
    title: `GitHub PR 代码评论：${pull_request?.title || '未知 PR'}`,
    elements: [
      {
        tag: 'markdown',
        content: [
          createContentItem('链接：', createLink(comment!.html_url)),
          createContentItem('作者：', createUserLink(comment!.user!)),
          createContentItem('PR：', createLink(pull_request!.html_url, `#${pull_request!.number}`)),
          createContentItem('评论：', comment?.body || '无'),
        ].join('\n'),
      },
    ],
  }),
};

// Main processor
const processEvent = (event: GitHubAction) => {
  const { event_name, action } = event;
  const actionText = getActionText(action);
  const handler = eventHandlers[event_name];

  if (!handler) throw new Error(`No handler found for event: ${event_name}`);

  try {
    return handler(event, actionText);
  } catch (cause) {
    throw new Error(
      `Error processing ${event_name} event: ${(cause as Error).message}`,
      { cause },
    );
  }
};

// Main execution
const event = JSON.parse((await stdin()) || '{}') as GitHubAction;
const result = processEvent(event);

if (result) {
  const card = {
    schema: '2.0',
    config: {
      wide_screen_mode: true,
    },
    header: {
      title: {
        tag: 'plain_text',
        content: result.title,
      },
      template: 'blue',
    },
    body: {
      elements: result.elements,
    },
  };
  console.log(JSON.stringify(card));
} else {
  throw new Error(
    `Unsupported ${event.event_name} event & ${event.action} action`,
  );
}
