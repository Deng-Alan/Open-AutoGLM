#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import io
from contextlib import redirect_stdout, redirect_stderr

# 设置输出编码
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

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
    max_steps=3,
    lang="cn",
    verbose=False  # 关闭详细输出以避免编码问题
)

# 创建 agent 实例
agent = PhoneAgent(
    model_config=model_config,
    agent_config=agent_config
)

# 执行任务
task = "打开设置"
print(f"Starting task: {task}", flush=True)

try:
    # 重定向输出到文件
    with open('autoglm_output.txt', 'w', encoding='utf-8') as f:
        with redirect_stdout(f), redirect_stderr(f):
            result = agent.run(task)

    # 读取并显示结果
    with open('autoglm_output.txt', 'r', encoding='utf-8') as f:
        output = f.read()
        print("\nTask completed!")
        print("=" * 50)
        print(output)

except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()