@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8

echo ========================================
echo AutoGLM 快捷启动脚本
echo ========================================
echo.
echo 使用方法：
echo 1. 确保手机已连接并开启USB调试
echo 2. 运行下面的命令来执行任务
echo.
echo 示例命令：
echo   python main.py --base-url https://open.bigmodel.cn/api/paas/v4 --model autoglm-phone --apikey cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9 --max-steps 10 "你的任务"
echo.
echo 正在测试连接...
echo.

python main.py --base-url https://open.bigmodel.cn/api/paas/v4 --model autoglm-phone --apikey cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9 --max-steps 1 --list-apps

pause