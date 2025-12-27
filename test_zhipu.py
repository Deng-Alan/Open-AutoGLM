#!/usr/bin/env python
# -*- coding: utf-8 -*-

import subprocess
import sys

# 构建命令
cmd = [
    sys.executable, "main.py",
    "--base-url", "https://open.bigmodel.cn/api/paas/v4",
    "--model", "autoglm-phone",
    "--apikey", "cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9",
    "--max-steps", "3",
    "打开设置"
]

# 设置环境变量
env = {
    **subprocess.os.environ,
    'PYTHONIOENCODING': 'utf-8'
}

# 运行命令
print("正在运行 AutoGLM（智谱官方API）...")
print("任务：打开设置")
print("-" * 50)

try:
    result = subprocess.run(
        cmd,
        env=env,
        capture_output=True,
        text=True,
        encoding='utf-8',
        timeout=120
    )

    if result.returncode == 0:
        print("✅ 任务执行成功！")
        print("\n输出：")
        print(result.stdout)
    else:
        print("❌ 任务执行失败")
        print("\n错误信息：")
        print(result.stderr)

except subprocess.TimeoutExpired:
    print("⏰ 执行超时")
except Exception as e:
    print(f"❌ 发生错误：{e}")