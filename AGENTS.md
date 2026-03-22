# Frontend 协作约定

## 工作流

- 默认遵循上级目录 `docs/fork-first-pr-workflow-short.md` 的 fork-first 流程。
- 当前仓库连接的是 Gitee fork：日常 `pull / push` 默认都走 `origin`，官方仓库只在手动同步和最终提 PR 时使用。
- 日常开发基于 `dev`，并保持 `dev` 跟踪 `origin/dev`。
- 新建分支统一使用 `codex/` 前缀；日常开发优先使用 `codex/wip-*`，整理官方 PR 时从 `upstream/dev` 开 `codex/pr-*`。
- 正常节奏：
  - 从 `dev` 拉最新
  - 开 `wip/*` 分支做开发
  - 在自己的 fork 上整理历史
  - 需要提 PR 时再从 `upstream/dev` 开干净的 `pr/*`
- 前端和后端是两个仓库，提交与 PR 都要分开处理。

## 提交约定

- 对于代理完成的 UI 修改、页面完善和其他明确的单元改动，在完成基本验证后默认自动创建本地提交，方便管理历史。
- 提交保持聚焦：一个完整意图一个提交；如果一个任务包含多个独立修改，应拆成多个提交。
- 代理完成的提交在通过基本验证后，默认自动 `push` 到当前仓库的 `origin` 当前分支，也就是用户自己的 Gitee fork。
- 除非用户明确要求，绝不向 `upstream` 执行 `push`。
- 如果工作区里已有用户自己的未提交改动，不要把这些无关改动混入代理的提交；必要时只提交本次改动，或者先说明阻塞。

## UI 协作约定

- 用户会实时查看网页效果并直接反馈；不要为了自查 UI 而使用 MCP、浏览器自动化或截图工具反复查看页面。
- 除非用户明确要求，不要使用 browser MCP、DevTools MCP 或其他浏览器自动化工具来定位、检查或验证前端界面问题；默认通过阅读代码、运行构建和让用户回看页面来协作。
- UI 修改优先做小步、局部、可回退的调整，避免无关的大范围重写。
- 运行 `npm run build` 后，必须把跟踪中的 `dist` 变动清理干净，不要把构建产物带进提交。
- 用户本地的 `.eslintrc-auto-import.json` 可能长期处于未提交状态；不要把它混入代理提交。

## 参考约定

- If the user says "my website", "my own site", "my previous site", or asks for a website reference without another qualifier, default that reference to `D:\Website\ExpensePro`.
- `CSA` 的前端改版默认同时参考上级目录 `docs/expensepro-ui-reference.md` 与 `docs/expensepro-component-code-reference.md`。
- `ExpensePro` 的参考重点是方法论，不是直接照搬视觉皮肤：优先借鉴稳定表面层级、克制卡片系统、动作色只用于强调，以及响应式通过重组结构而不是简单压缩桌面布局。
- 代码组织优先借鉴 `ExpensePro` 的实现方式：顶层父层统一管理业务数据，子组件专注交互；复杂交互拆成独立功能块；重页面按状态和职责分层，而不是把逻辑堆在一个组件里。
