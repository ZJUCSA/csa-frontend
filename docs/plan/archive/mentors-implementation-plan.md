<!--
职责范围：记录教师介绍页 `/mentors` 的阶段实施计划、临时数据契约和阶段审查边界。
功能边界：本文档只用于本轮分阶段开发协调，不替代教师主页功能 spec、设计指引、后端接口文档或最终维护手册。
-->

# 教师介绍页临时实施计划

## 1. 分支和提交原则

- 前端分支：`feature/mentors-roster`。
- 后端分支：进入后端阶段时再从 `backend/main` 新建同名分支。
- 每个 phase 只完成一个单元目标。
- 每个 phase 完成后先停下来给出一句话总结、变更范围和验证结果。
- 阶段审查通过后再提交对应 commit，不把多个 phase 揉进同一个 commit。
- 正式资料填充单独提交，不与 UI、路由、组件或接口逻辑混合。

## 2. Phase 划分

### Phase 0：字段与 JSON 契约确认

目标：在不改 UI 的前提下，把前端临时 JSON、未来后端 API 和详情页字段需求统一起来。

交付：

- 本实施计划。
- 临时 JSON / API 字段草案。
- 四位教师头像迁移映射。

建议提交：

- `docs: outline mentors data contract`

### Phase 1：前端静态数据与资源准备

目标：只迁移四位教师头像，并新增临时 mock 数据文件；资料字段允许留空或只填基础占位。

交付：

- `public/mentors/...` 下的四位教师头像。
- 前端可读取的临时 mentors 数据文件。
- 不迁移旧 gallery，不迁移旧强宣传文案，不迁移其他教师。

建议提交：

- `feat: add mentors seed assets`

### Phase 2：导师主页 UI

目标：新增 `/mentors` 路由、导航栏入口和导师列表页，先消费本地临时数据。

交付：

- `/mentors` 页面。
- 导航栏入口。
- loading、empty、error 三种状态的可用 UI。
- 浅色 / 深色主题和移动端基本适配。

建议提交：

- `feat: add mentors overview page`

### Phase 3：导师详情页 UI

目标：新增 `/mentors/:id`，详情页和主页分开设计，只共享必要的数据读取逻辑。

交付：

- `/mentors/:id` 详情页。
- 详情页独立布局。
- 未找到教师时的温和提示。

建议提交：

- `feat: add mentor detail pages`

### Phase 4：正式内容填充

目标：单独填充四位教师的公开资料、外部链接、来源说明和同步时间占位。

交付：

- 只包含数据变更的 commit。
- 资料以公开来源和客观表述为准。
- 字段缺失时保留空值或说明，不编造信息。

建议提交：

- `data: fill mentors public profile data`

### Phase 5：前端验证与修整

目标：跑构建并根据实际页面表现做小范围修整。

交付：

- `pnpm build` 通过。
- 桌面端、移动端、浅色 / 深色主题检查。
- 外链、头像、文字溢出和横向滚动检查。

建议提交：

- `fix: polish mentors responsive states`

### Phase 6：后端 JSON API

目标：后端先用 JSON 实现教师 API，暂不引入数据库和复杂同步器。

交付：

- `GET /api/teachers/list`。
- `GET /api/teachers/detail?id=...`。
- `POST /api/teachers/sync` 使用 `login_required_publisher` 保护；第一版可做 JSON reload / 状态刷新，不做真实爬取。
- `/docs` 可看到教师相关 API。

建议提交：

- `feat: add teachers json api`

### Phase 7：前端切换到 API

目标：前端从本地 mock 切换到 `/api/teachers/*`，保留同一套 UI 状态。

交付：

- 导师主页和详情页从后端 API 读取数据。
- API 失败时页面不崩溃。

建议提交：

- `feat: connect mentors pages to teachers api`

## 3. 临时 JSON / API 契约草案

前端临时数据和后端 JSON API 使用同一套字段语义。字段允许为空，但字段名尽量保持稳定，避免 Phase 6 和 Phase 7 返工。

### 3.1 列表响应

```json
{
  "items": [
    {
      "id": "li-song",
      "name": "李松",
      "title": "",
      "affiliation": "",
      "research_areas": [],
      "summary": "",
      "email": "",
      "avatar_url": "/mentors/li-song/avatar.png",
      "homepage_urls": [],
      "source_url": "",
      "source_status": "manual_seed",
      "last_synced_at": "",
      "sync_note": ""
    }
  ],
  "meta": {
    "last_synced_at": "",
    "source_status": "manual_seed",
    "source_url": "",
    "sync_note": "临时 JSON 数据，后续接入后端同步。"
  }
}
```

### 3.2 详情响应

```json
{
  "item": {
    "id": "li-song",
    "name": "李松",
    "title": "",
    "affiliation": "",
    "research_areas": [],
    "summary": "",
    "bio": "",
    "email": "",
    "avatar_url": "/mentors/li-song/avatar.png",
    "homepage_urls": [
      {
        "label": "教师个人主页",
        "url": "",
        "type": "profile"
      }
    ],
    "source_url": "",
    "source_status": "manual_seed",
    "last_synced_at": "",
    "sync_note": "",
    "profile_sections": []
  },
  "meta": {
    "last_synced_at": "",
    "source_status": "manual_seed",
    "source_url": "",
    "sync_note": "临时 JSON 数据，后续接入后端同步。"
  }
}
```

### 3.3 字段说明

- `id`：稳定英文标识，只允许 `li-song`、`du-wenliang`、`lin-feng`、`shen-dakun`。
- `name`：中文姓名。
- `title`：职称 / 岗位头衔，可暂空。
- `affiliation`：所属学院或单位，可暂空。
- `research_areas`：研究方向字符串数组，可暂空。
- `summary`：列表卡片的一句客观摘要，可暂空。
- `bio`：详情页正文简介，可暂空。
- `email`：公开邮箱，可暂空。
- `avatar_url`：前端公开资源路径。
- `homepage_urls`：外部主页链接数组，所有前端渲染外链均使用新窗口和 `rel="noopener noreferrer"`。
- `source_url`：主要来源链接，可暂空。
- `source_status`：临时阶段使用 `manual_seed`；未来可扩展为 `synced`、`stale`、`failed`。
- `last_synced_at`：ISO 8601 字符串；临时阶段可为空。
- `sync_note`：字段缺失、个人主页暂未开放或人工补充说明。
- `profile_sections`：详情页可选扩展内容，第一版不强依赖。

## 4. 头像迁移映射

只迁移以下四个头像，不迁移 gallery，也不迁移旧数据中的其他教师。

| 教师 | 旧文件 | 新文件 |
| --- | --- | --- |
| 李松 | `old/csa-website-gitee/public/roster/LiSong/avatar.png` | `frontend/public/mentors/li-song/avatar.png` |
| 杜文亮 | `old/csa-website-gitee/public/roster/DuWenliang/avatar.jpg` | `frontend/public/mentors/du-wenliang/avatar.jpg` |
| 林峰 | `old/csa-website-gitee/public/roster/LinFeng/avatar.jpg` | `frontend/public/mentors/lin-feng/avatar.jpg` |
| 申大坤 | `old/csa-website-gitee/public/roster/ShenDakun/avatar.png` | `frontend/public/mentors/shen-dakun/avatar.png` |

