# Taoist's Space 项目说明

这是一个基于纯静态(Vanilla HTML/JS/CSS) GitHub Pages 构建的个人博客系统。



## 运行原理 (GitHub Pages)

本项目使用了 **GitHub Pages** 的免费静态网站托管服务。当把代码推送到 GitHub 的一个特定仓库（通常按照自己 Github 用户名构建的仓库），并且开启了 GitHub Pages 服务，此时 GitHub 会在后台自动启动一个 Nginx/Apache 这样的 Web 服务器。用户访问的时候，服务器会自动寻找仓库根目录下的 `index.html` 文件作为网站的主入口页面。

- 当用户在浏览器中输入 `https://volmodaoist.github.io/volmodaoist/` 这个链接的时候，GitHub 服务器就会将 `index.html` 的内容返回给浏览器。
- 浏览器解析 `index.html` 之后，发现其引用了存放在 `static/css/`、`static/js/` 下的样式和脚本文件，以及 `contents/` 下面的数据文件，接着浏览器会向同样的域名发起请求把这些静态资源都下载下来，最终拼装成完整的可视化页面。

这个个人博客，早期是通过 JS 编写的，后来经过 TS 进行组件化重构，虽然改变了开发工作流，但是只要最终提供给 GitHub Pages 解析的产物结构没有本质改变，依然是标准的静态网站结构，依然能在 GitHub 上面展示，所有运行时必需的文件，e.g. 编译之后的 JS、CSS、三方库文件都被保留在了对应的静态目录中。



## 项目架构与目录结构

为了保证代码的可维护性和规范化，本项目采用了 TypeScript 进行业务逻辑的开发，将源码与编译后的执行代码进行了物理隔离。

```text
.
├── Makefile                # 提供便捷的开发命令，如 `make dev` 和 `make build`
├── package.json            # npm 配置文件，包含 TypeScript 开发依赖及打包命令
├── tsconfig.json           # TypeScript 编译器配置，指定输出目录及 ES 标准
├── index.html              # 网站的主页（个人简介、项目、获奖展示）
├── pages/                  # 独立的 HTML 子页面
│   └── notes.html          # 笔记系统页面（带有检索与展示能力）
├── src/                    # TypeScript 核心源码目录 (开发阶段主要修改这里)
│   ├── components/         # 可复用的 UI 组件或类（如 Navbar.ts）
│   ├── pages/              # 各个 HTML 页面对应的业务逻辑脚本（home.ts, notes.ts）
│   ├── utils/              # 通用工具函数库（e.g. config.ts 负责数据拉取加载）
│   └── global.d.ts         # 外部依赖库（e.g. marked, jsyaml）的全局类型声明
├── static/                 # HTML 直接引用的静态资源目录
│   ├── assets/             # 图片、Favicon 等多媒体资源
│   ├── css/                # 网站样式文件
│   └── js/                 # JavaScript 相关
│       ├── dist/           # 【自动生成的目录】 通过 tsc 来将 src/ 下面的 TS 编译而来的 JS 产物，无需手动修改
│       └── *.min.js        # 直接引入的第三方依赖（Bootstrap, Marked, JS-YAML, MathJax 等）
└── contents/               # 数据存储层 (Data Layer)
    ├── config.yml          # 全局配置，用于控制 Navbar 和 Footer 的文案等
    ├── includes/           # 主页需要通过 Markdown 动态渲染的纯文本区块
    ├── notes.json          # 笔记索引数据（包含所有笔记的元信息及标签）
    └── notes/              # 存放所有 Markdown 格式文章/笔记的实体文件
```

---

## 本地开发与调试流程

由于项目中使用了 `fetch` API 来异步请求拉取本地的 `config.yml` 和各类 `.md` 文件，如果直接双击在浏览器中打开 `index.html` (使用 `file://` 协议)，浏览器会因为 **CORS（跨域资源共享安全策略）** 拦截掉这些读取本地文件的请求，因而必须通过一个本地的 HTTP Web 服务器来运行（如 `http://localhost:8000`）。

- 本地启动步骤：

  1. **确保环境就绪**
     - 确保你已经安装了 Node.js / npm 环境。
     - 在项目根目录执行 `npm install` 下载依赖。


  2. **使用 Makefile 快速启动**，终端运行：`make dev`

  3. **后台发生了什么？**

     - 首先执行 `npm run build`：调用 `tsc` (TypeScript Compiler) 扫描 `src/` 所有源码文件，翻译变为 ES2020 标准的 JavaScript，并且统一打包存放到 `static/js/dist/` 目录中。

     - 随后启动 `python3 -m http.server 8000`：来在本地的 `8000` 端口挂载一个 HTTP 服务，专门代理当前所在的文件夹。

  4. **预览和调试**：修改 `src/` 目录的源码，重新运行 `make build` 或 `make dev`，并在浏览器中刷新即可

---

## 如何发布博客 / 新增内容

这个系统采用了 **“内容即数据”** 这种低耦合模式。无需修改任何代码，只需要修改 `contents/` 文件夹下面的 Markdown 数据文件。

- **更新主页简历或经历**：直接编辑 `contents/includes/` 目录下面的 `.md` 文件。
- **发布新的笔记/文章**：
  1. 通过 `contents/notes/` 目录下新建 `.md` 文件并撰写内容。
  2. 随后打开 `contents/notes.json` 索引文件，再在这个数组之中新增一条该笔记的信息，包括标题、描述、发布日期、分类标签 `tags` ，以及对应的 `.md` 文件名
  3. 保存文件，主页的笔记墙会自动渲染新的卡片，并且立刻支持搜索过滤

最终，通过 `git add`、`git commit`、`git push` 命令将改动推送到 GitHub 的 `master` 分支，GitHub Pages 会在几十秒内自动部署并更新在线个人主页。
