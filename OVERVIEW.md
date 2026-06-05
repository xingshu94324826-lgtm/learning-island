# 729 学习岛 — 项目全貌

**网址**: https://xingshu94324826-lgtm.github.io/learning-island/
**本地**: D:\my_ai_test\learning-island

---

## 页面路由（当前）

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | HomePage | Dashboard: 考研倒计时 + 三轮切换 + 掌握度圆环 + 科目卡片 + 进度条 |
| `/subject/:id` | SubjectPage | 章节浏览: 框架树(弱项高亮) + 可折叠考点卡片 + 薄弱点勾选 + 庆祝动画 |
| `/flashcards/:id` | FlashcardsPage | 闪卡: 全部/弱项分池 + 翻转 + 清弱项 |
| `/graph/:id` | GraphPage | 知识图谱: tag云 + 章节展开 |
| `/search` | SearchPage | 搜索: 模糊搜索+关键词高亮 + 薄弱点优先级 |
| `/review` | ReviewPage | ⚡ 弱点总控台: 薄弱点/低掌握度/弱项闪卡/真题错题 四Tab |
| `/exam` | ExamPage | 真题: 列表浏览/闪卡刷题/问答模式 |
| `/quickquiz` | QuickQuizPage | 速测: 随机抽考点→脑中回忆→揭晓答案→会了/没记住 |
| `/template` | TemplatePage | 教案模板: 八套教学设计模板(一般模式/翻转课堂/PBL等) |
| `/changelog` | ChangelogPage | 版本记录时间线 |

---

## 新增的核心能力

### 1. ProgressContext — 掌握度+间隔复习调度
`src/contexts/ProgressContext.tsx`

每个考点可标记 0-5 级掌握度，不同级别有对应的复习间隔:
```
mastery 1 → 1天后复习
mastery 2 → 3天后
mastery 3 → 7天后
mastery 4 → 15天后
mastery 5 → 30天后
```
首页自动统计「今日待复习」数量 + 预计耗时。

### 2. examData — 历年真题库
`src/data/examData.ts`

2015-2021 年所有名词解释真题，带答案和重要性标记。ExamPage 提供三种模式:
- List: 按年份筛选浏览
- Quiz: 闪卡式刷真题
- QA: 随机高频词 → 手打答案 → 对照标准

### 3. TemplatePage — 教案模板库
8 套教学设计模板（一般模式/翻转课堂/PBL/创客/STEM/STEAM/微格教学/信息技术与课程整合），用 Collapse 折叠展示。

### 4. ReviewPage — 弱点总控台
把分散在各处的「弱项」统一到一个页面:
- 未勾选薄弱点（来自 SubjectPage 的 checklist）
- 低掌握度考点（mastery 1-2）
- 弱项闪卡（fc-weak-pool）
- 真题错题（exam-weak-pool）

### 5. QuickQuizPage — 闪卡 2.0
随机抽考点 → 脑中回忆 → 点「揭晓答案」→ 会了(跳过)/没记住(自动 mark mastery=1)

### 6. ChangelogPage
按版本记录所有变更，含 feature/fix/content/refactor 分类标签。

### 7. 框架树弱项高亮
FrameworkTree 组件自动检测薄弱点，红色高亮 ⚠️ 标记。

### 8. 一键导出 Markdown
系统从框架树+掌握度+笔记+薄弱点自动汇总个人知识档案，导出为 .md 文件下载。

### 9. 自动标签系统
parse-cards.ts 从标题+内容匹配 40 组关键词（如「AECT」「建构主义」「系统论」），34 个核心概念跨三科自动打 tag。
