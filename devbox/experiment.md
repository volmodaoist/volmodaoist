深度学习实验型项目需要工程化的管理思路, 一般目录, 大抵思路是通过配置文件驱动实验

- 读取一个配置文件, 一个配置对应实验, 通过 BaseMsdel 进行配置类对象管理
  - 中间日志写入 `outputs/logs` 以便排查
  - 最终结果写入 `outputs/trace/` 以便回顾
- 实验配置管理
  - 需要对比的模型主要放在 `models` 或 `baseline` 目录下面
  - 关联大量子试验 shell 脚本,主要放在 `scripts`  目录之下
  - 复杂的命令通过 `Makefile` 关联 shell 脚本简化
- 数据集处理
  - 数据集集中放在`data/` 或 `datasets/` 
  - 数据集相关的处理则在 `src/dataset_pipline` 目录下面









