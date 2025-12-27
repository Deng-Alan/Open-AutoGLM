@echo off
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
python main.py --base-url https://api-inference.modelscope.cn/v1 --model ZhipuAI/AutoGLM-Phone-9B --apikey cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9 --max-steps 5 %*