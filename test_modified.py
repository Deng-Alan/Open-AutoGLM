#!/usr/bin/env python
# -*- coding: utf-8 -*-

import subprocess
import sys
import os

# 设置环境变量
env = {
    **os.environ,
    'PYTHONIOENCODING': 'utf-8'
}

print("测试修改后的代码...")
print("=" * 50)

# 测试命令 - 只检查系统要求，不执行任务
cmd = [sys.executable, "main.py", "--list-apps"]

try:
    # 运行命令
    result = subprocess.run(
        cmd,
        env=env,
        capture_output=True,
        text=True,
        encoding='utf-8',
        timeout=30
    )

    print("命令执行结果:")
    print("-" * 50)

    # 检查是否使用了智谱API
    if "https://open.bigmodel.cn/api/paas/v4" in result.stderr:
        print("✅ 已成功修改为使用智谱API")
    elif "http://localhost:8000/v1" in result.stderr:
        print("❌ 仍使用本地API")
    else:
        print("? 未检测到API地址")

    # 显示输出
    if result.stdout:
        print("\n输出内容:")
        print(result.stdout[:500])  # 只显示前500个字符

    if result.returncode == 0:
        print("\n✅ 修改成功！现在可以直接运行: python main.py")
    else:
        print(f"\n❌ 错误: {result.stderr}")

except Exception as e:
    print(f"❌ 测试失败: {e}")