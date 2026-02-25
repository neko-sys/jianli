# Resume Builder 重构计划（新建 shadcn 项目）

## 目标
- 新建干净的 `React + TypeScript + Vite + shadcn/ui` 项目。
- 停止在旧项目继续修样式债，采用模块化迁移。
- 先保证核心流程可用：创建简历、编辑、预览、导出。

## 建议新目录
- `e:\react\jianli-next`

## 第一阶段：初始化新项目
1. 创建 Vite React TS 项目。
2. 安装并初始化 shadcn/ui（使用官方推荐配置）。
3. 配置路径别名 `@/* -> src/*`。
4. 建立基础布局与路由。

## 第二阶段：先迁移“稳定内核”
- `core/domain`（类型、schema、layout 规则）
- `core/storage`（IndexedDB/Dexie）
- `shared/utils`（文件、排序、防抖等）
- 先不迁移旧样式文件，避免把债带过去。

## 第三阶段：按页面迁移（从简到难）
1. DashboardPage
2. SettingsPage
3. EditorPage（拆分）
4. PrintPage

## 第四阶段：Editor 模块拆分
- `features/editor/sections/ProfileSection.tsx`
- `features/editor/sections/JobTargetSection.tsx`
- `features/editor/sections/EducationSection.tsx`
- `features/editor/sections/WorkSection.tsx`
- `features/editor/sections/SkillsSection.tsx`
- `features/editor/sections/ProjectsSection.tsx`
- `features/editor/LayoutEditorCard.tsx`
- `features/editor/BasicActionsCard.tsx`
- `features/editor/TemplatePreview.tsx`

> 原则：每个 section 组件只处理本 section 的状态更新，不跨模块写 layout。

## 第五阶段：UI 规范
- 表单控件统一使用 shadcn 组件（Input/Select/Checkbox/Textarea/Button/Card）。
- 所有弹层统一使用 shadcn/Radix（Select/Popover/Dialog），避免 z-index 自定义地狱。
- 主题 token 只保留一份（`globals.css` + CSS variables）。

## 第六阶段：验证与替换
1. 功能对齐 checklist：
   - 新建/删除简历
   - 模板切换
   - 模块显隐
   - 条目新增/删除/排序
   - JSON 导入导出
   - PDF 导出
2. 手工回归通过后，再切换主目录。

## 迁移建议（避免重蹈覆辙）
- 旧项目里“可运行但脏”的样式和拖拽实现，不要直接复制。
- 先做最小可用，再增加视觉增强（底纹、主题等）。
- 新项目中任何“全局覆盖 CSS”必须登记原因和影响范围。

## 你装好 Node 后，我可以立即执行
1. 在 `e:\react\jianli-next` 完整初始化新项目。
2. 一次性接入 shadcn 并创建基础页面骨架。
3. 当天先迁移 Dashboard + Settings + Domain/Storage。
