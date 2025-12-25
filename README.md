# Nature 翻译优化助手 (Nature Translation Optimizer)
一款专为 **Chrome 浏览器** 设计的轻量级扩展，旨在解决阅读 **Nature** 系列期刊（如 _Nature, Nature Methods, Nature Genetics_ 等）时，开启网页翻译导致的排版不协调问题。

🔍 为什么需要它？
当使用 Chrome 自带翻译阅读 Nature 系列的学术论文时，网页布局往往会被破坏：
正文错位：部分翻译之后的正文会错误的变成上标形式。
标签干扰：大量 `<sup></sup>` 标签会嵌入到正文中，极度干扰阅读视线。

✨ 核心功能

- 🚀 自动排版修复：检测到翻译开启后，自动将文献编号缩小、上浮，并恢复学术蓝颜色标识。

- 📖 双阅读模式：

  - 规范模式：保持引用可见，但修复其大小与位置，确保点击跳转功能正常。

  - 沉浸模式：完全隐藏文中所有引用编号，提供极致的纯净阅读体验。

- 🎯 精准域名锁定：仅在 *.nature.com 域名下激活，不干扰其他无关网页的运行。

  ![](.\imgs\sketch.png)

🛠️ 安装指南

通过 Chorme 开发者模式安装：

1. 下载 [Nature_Optimizer.zip](https://github.com/gstaryu/nature-translate-fixer-chrome/releases/tag/v1.0.0) 文件。
2. 打开 Chrome 浏览器，访问 chrome://extensions/。
3. 开启右上角的 “开发者模式”。
4. 将 zip 文件拖入即可。

📁 项目结构

- manifest.json: 插件配置文件（Manifest V3 标准）。
- content.js: 核心逻辑，包含 DOM 监听、翻译感应与 CSS 注入。
- popup.html/js: 简洁的控制面板，用于切换阅读模式。
- icons/: 包含 16px、48px、128px 三种尺寸的logo。

⚖️ 开源协议
本项目采用 MIT License 协议。