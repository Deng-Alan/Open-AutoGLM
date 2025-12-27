#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from phone_agent import PhoneAgent
from phone_agent.model import ModelConfig
from phone_agent.agent import AgentConfig

# 配置参数
base_url = "https://api-inference.modelscope.cn/v1"
model = "ZhipuAI/AutoGLM-Phone-9B"
apikey = "cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9"

# 创建模型配置
model_config = ModelConfig(
    base_url=base_url,
    model_name=model,
    api_key=apikey
)

# 创建 agent 配置
agent_config = AgentConfig(
    max_steps=5,
    lang="cn"
)

# 创建 agent 实例
agent = PhoneAgent(
    model_config=model_config,
    agent_config=agent_config
)

# 执行任务
task = "打开设置查看电量"
print(f"执行任务: {task}")
print("-" * 50)

try:
    result = agent.run(task)
    print("\n任务结果:", result)
except Exception as e:
    print(f"\n错误: {e}")
    import traceback
    traceback.print_exc()