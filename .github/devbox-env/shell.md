# 个人开发工具套件

开发工具
- 设备 MacOS
- 终端 Iterm2 Shell + ZSH/Zim 增强配置 (Zim 和 Oh-My-Zsh 通常二选一即可)
	- zmodule zdharma-continuum/fast-syntax-highlighting
	- zmodule pabloariasal/zfm
- Vim 生态工具
	- 终端搜索工具 fzf
		- `Ctrl+T`：查找文件并插入到命令行
		- `Ctrl+R`：搜索历史命令
		- `Alt+C`：模糊跳转目录
	- 终端 lazygit 可视化工具 (设置热键option+G，因为CMD+G可以使用vim跳转具体行)
	- 终端文件管理器 yazi
	- 终端分屏工具 tmux 分屏 (Iterm2 亦可支持 command+(shift)+d 快捷键分屏)

- Obsidian Xterm256 模拟终端
  - 模拟终端的配置详见 `obsidian-terminial-setting.json`, 
  - 配置方面最好使用 Oh-My-Zsh, 而不使用Zim, 这样兼容性会更好
  - 建议通过本地脚本把自己的 `zshrc` 配置 wrap 包装一层, 注入用户控制 zim 开关的环境变量