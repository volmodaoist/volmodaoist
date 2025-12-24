# 个人开发工具套件

开发工具
- 设备 MacOS
- 终端 Iterm2 Shell + ZSH + Zim 增强配置 + Zim 插件
	- zmodule zdharma-continuum/fast-syntax-highlighting
	- zmodule pabloariasal/zfm
- Vim 生态工具
	- 终端搜索工具 fzf
		- `Ctrl+T`：查找文件并插入到命令行
		- `Ctrl+R`：搜索历史命令
		- `Alt+C`：模糊跳转目录
	- 终端 lazygit 可视化工具 (设置热键option+G，因为CMD+G可以使用vim跳转具体行)
	- 终端文件管理器 yazi
	- 终端分屏工具 tmux 分屏


```shell
# 使得搜索的结果写到某个文件之中
fzf --zsh > fzf.zsh

# 再在 ~/.zshrc 之中添加下列代码
source fzf.zsh
```
