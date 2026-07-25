# 📋 项目架构与全貌进度文档 (Project Architecture & Progress Documentation)

## 1. 🎯 项目整体状态与最新进度 (Overall Project Status & Latest Progress)
- **核心理念与视觉风格**：响应式现代暗黑风 UI，结合 Disney 12条动画原则、Glassmorphism 玻璃拟态、高度动感的 WAAPI 硬件加速动画与 3D Three.js/Canvas 交互。
- **已完成的核心功能**：
  1. **开屏页动画 (Splash Screen)**：完美实现 `Elastic Bounce (果冻弹跳)` -> `Press & Pop (按压弹起)` 的物理质感。
  2. **导航栏 Logo 动画 (Navbar Logo Entrance & Hover)**：
     - **入场**：与开屏页淡出 (1800ms) 零延迟同步，触发 **分段错位拼接 (Segmented Reveal)** + **3D Coin Flip 翻转**（使用原生 Web Animations API 直接由 GPU 渲染，彻底消除跳帧）。
     - **Hover 悬停**：鼠标悬停触发 `4s慢速`、`2px粗细` 的原汁原味 SVG 钢笔手写描边路径动画 (`strokeDraw`)。
  3. **Hero 动态屏**：三行解密打字机效果 (Scrambled Text Decipher Animation) 与全局跟随光标 (Cursor Dot/Outline)。
  4. **Sanity CMS 后台集成**：支持从 Sanity CMS 动态拉取 Blog 文章、Projects 项目案例和 About 个人经历。
  5. **响应式多页面架构**：Index 首页、About 关于页、Projects 项目展示页、3D-Demo 演示页、LangChain-Demo AI展示页，以及 SVG Logo 动画测试实验室 (`logo-preview.html`)。

---

## 2. 📂 目录层级结构 (Directory Hierarchy)

```
d:/Desktop/year3/Sem3/UCCD2063 ARTIFICIAL INTELLIGENCE TECHNIQUES/blog/
├── 📄 index.html                     # [主入口] 网站首页 HTML (Hero解密、3D Canvas背景、博客概览)
├── 📄 about.html                     # [子页面] 个人经历与技能介绍页
├── 📄 projects.html                  # [子页面] 硬件与软件项目案例展示页
├── 📄 3d-demo.html                   # [演示页] Three.js / Canvas 3D 物理交互实验室
├── 📄 langchain-demo.html            # [演示页] AI Agent 与 LangChain 节点可视化演示页
├── 📄 logo-preview.html              # [测试页] Logo 5种矢量动画方案的测试预览实验室
├── 📄 package.json                   # [配置] 项目 NPM 依赖与构建命令
├── 📄 vite.config.js                 # [配置] Vite 多页面打包构建与路由配置
├── 📄 design_resources.md            # [文档] 设计资源与色彩规范
├── 📄 PROJECT_ARCHITECTURE_AND_PROGRESS.md # [文档] 本架构与全貌进度说明文档
├── 📁 src/                           # 核心前端代码库
│   ├── 📄 main.js                    # [主逻辑] 入口 JS (控制 Splash、Logo WAAPI、Sanity 数据拉取)
│   ├── 📄 style.css                  # [主样式] 核心 CSS (动画定义、Glassmorphism、Logo Hover描边)
│   ├── 📄 sanity.js                  # [工具] Sanity CMS API 客户端配置文件
│   ├── 📄 3d-scene.js                # [3D逻辑] 首页 3D 背景交互场景渲染器
│   ├── 📄 3d-demo.js                 # [3D逻辑] 3D-demo 页面专用 Three.js 逻辑
│   ├── 📄 ascii-text.js              # [特效] ASCII 字符矩阵动画组件
│   ├── 📄 bubble-menu.js / .css      # [组件] 悬浮气泡导航菜单逻辑与样式
│   ├── 📄 metaballs.js               # [特效] WebGL 融球物理效果渲染
│   ├── 📄 option-wheel.js            # [组件] 交互式选项轮盘菜单
│   ├── 📄 scrambled-text.js / .css   # [组件] Hero 标题文字解密特效逻辑与样式
│   ├── 📄 specular-button.js / .css  # [组件] 镜面高光反射按钮效果
│   ├── 📄 spiderverse-button.css     # [样式] 蜘蛛宇宙朋克风格按钮样式
│   └── 📁 assets/                    # [资源] 图片、图标与静态多媒体资源
├── 📁 studio/                        # Sanity CMS 后台管理系统
│   ├── 📄 sanity.config.js           # Sanity Studio 配置文件
│   ├── 📄 sanity.cli.js              # Sanity CLI 工具配置
│   ├── 📁 schemaTypes/               # 数据模型定义目录
│   │   ├── 📄 blogPost.js            # 博客文章数据结构
│   │   ├── 📄 project.js             # 项目案例数据结构
│   │   ├── 📄 aboutItem.js           # 个人经历数据结构
│   │   └── 📄 index.js               # Schema 汇总导出
│   └── 📄 create-*-*.js              # Sanity 数据批量导入/删除脚本
├── 📁 dist/                          # 构建产物目录 (vite build 输出)
├── 📁 scratch/                       # 自动化辅助工具脚本目录 (用于代码修补与自动生成)
└── 📁 public/                        # 静态资源公开访问目录
```

---

## 3. 🔍 每一个核心文件的详细作用说明 (File Responsibilities)

### 3.1 🌐 HTML 页面组件 (Page Templates)
| 文件名 | 对应 URL | 核心作用与主要功能 |
| :--- | :--- | :--- |
| `index.html` | `/` | 网站核心首页。包含全屏 Splash 屏、内联 SVG Navbar Logo、Hero 三行解密文字、3D Canvas 背景、动态 Blog 列表容器与全站 Footer。 |
| `about.html` | `/about.html` | 关于我与技能页。包含 Splash 屏、Navbar Logo、时间轴 (Timeline)、技能卡片与动态 Sanity 个人经历。 |
| `projects.html` | `/projects.html` | 项目展示页。支持按 Hardware / AI Agent / Web 等分类筛选项目，并由 Sanity 动态加载卡片。 |
| `3d-demo.html` | `/3d-demo.html` | Three.js 高阶 3D 渲染实验室。展示复杂的着色器与粒子交互效果。 |
| `langchain-demo.html` | `/langchain-demo.html` | AI Agent 可视化节点流。展示智能体推理过程。 |
| `logo-preview.html` | `/logo-preview.html` | Logo 动画专属实验室。内含 5 种 SVG 动画对比（描边、ClipPath 揭露、粒子笔迹、墨水扩散、分段错位飞入）。 |

### 3.2 ⚡ 前端核心逻辑与样式 (Frontend Source - `src/`)
| 文件名 | 核心作用与实现机制 |
| :--- | :--- |
| `src/main.js` | **全站大脑**。实现开屏页物理弹跳动画、Navbar Logo 的 WAAPI 3D Coin Flip + 分段错位动画，初始化全局光标，拉取 Sanity 数据。 |
| `src/style.css` | **全站主样式**。定义 HSL 颜色变量、Glassmorphism 玻璃拟态、`.nav-draw-path` 悬停 4s 手写描边动画 (`strokeDraw`) 及基础复位。 |
| `src/sanity.js` | **Sanity CMS 客户端**。配置 `projectId` 与 `dataset`，暴露 Sanity `fetch` 接口。 |
| `src/3d-scene.js` | 首页背景 3D 场景控制脚本，基于 Canvas / Three.js。 |
| `src/bubble-menu.js` | 移动端/桌面端的悬浮气泡导航菜单逻辑，支持展开与卡片交互。 |
| `src/scrambled-text.js` | 文字乱码解密效果，在 Hero 区域输出各种赛博朋克风文本。 |
| `src/specular-button.js` | 3D 拟真镜面按钮，根据鼠标移动位置实时计算光照贴图与反射角度。 |

### 3.3 🛠️ CMS 后台系统 (`studio/`)
| 文件名 | 核心作用 |
| :--- | :--- |
| `studio/sanity.config.js` | Sanity 后台面板配置。 |
| `studio/schemaTypes/blogPost.js` | 博客文章 Schema（标题、Slug、摘要、发布时间、标签、正文）。 |
| `studio/schemaTypes/project.js` | 项目案例 Schema（项目名、封面、描述、分类、技术栈、链接）。 |
| `studio/schemaTypes/aboutItem.js` | 经历 Schema（年份、职位/事件、详细介绍、图标类别）。 |

---

## 4. 🚀 部署与打包指令 (Commands & Operations)
- **本地开发**: `npm run dev` (通过 Vite 启动开发服务器)
- **生产构建**: `npm run build` (打包至 `dist/` 目录)
- **本地预览构建**: `npm run preview`
