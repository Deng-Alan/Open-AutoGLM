@echo off
chcp 65001>nul
set PYTHONIOENCODING=utf-8

python main.py --base-url https://open.bigmodel.cn/api/paas/v4 --model autoglm-phone --apikey cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9 %*