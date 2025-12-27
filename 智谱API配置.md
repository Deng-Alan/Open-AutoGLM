# 智谱官方 API 配置

## 快速使用

### 命令行方式
```bash
python main.py --base-url https://open.bigmodel.cn/api/paas/v4 --model autoglm-phone --apikey cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9 "你的任务"
```

### 批处理脚本方式
```bash
run_zhipu_autoglm.bat "你的任务"
```

### 示例
```bash
# 打开微信
run_zhipu_autoglm.bat "打开微信"

# 搜索淘宝
run_zhipu_autoglm.bat --max-steps 15 "打开淘宝搜索手机"

# 发送微信消息
run_zhipu_autoglm.bat --max-steps 20 "打开微信给文件传输助手发送你好"

# 查看支持的应用
run_zhipu_autoglm.bat --list-apps
```

## 配置参数

- **API 地址**: https://open.bigmodel.cn/api/paas/v4
- **模型**: autoglm-phone
- **API Key**: cddd65aada5d4af491f51b9cafce4d73.jJU25jPbY6QI3SO9

## 说明

智谱官方 API 的优势：
1. 响应速度快
2. 稳定性高
3. 无需本地部署模型
4. 直接使用官方最新优化

注意：需要确保网络连接正常，能够访问智谱 AI 的服务。