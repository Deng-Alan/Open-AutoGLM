import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import './SettingsModal.css'

function SettingsModal() {
    const { config, isSettingsOpen, setConfig, setSettingsOpen } = useAppStore()

    const [formData, setFormData] = useState({
        baseUrl: '',
        model: '',
        apiKey: '',
        maxSteps: 10,
        lang: 'cn' as 'cn' | 'en'
    })

    // 同步配置到表单
    useEffect(() => {
        if (isSettingsOpen) {
            setFormData({
                baseUrl: config.baseUrl,
                model: config.model,
                apiKey: config.apiKey,
                maxSteps: config.maxSteps,
                lang: config.lang
            })
        }
    }, [isSettingsOpen, config])

    // 保存设置
    const handleSave = async () => {
        try {
            await window.electronAPI.saveConfig(formData)
            setConfig(formData)
            setSettingsOpen(false)
        } catch (error) {
            console.error('保存设置失败:', error)
        }
    }

    // 关闭弹窗
    const handleClose = () => {
        setSettingsOpen(false)
    }

    // 阻止事件冒泡
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    if (!isSettingsOpen) return null

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        <span className="modal-icon">⚙️</span>
                        设置
                    </h2>
                    <button className="close-btn" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {/* API 配置 */}
                    <div className="settings-section">
                        <h3 className="section-title">API 配置</h3>

                        <div className="form-group">
                            <label className="form-label">API 地址</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.baseUrl}
                                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                                placeholder="https://open.bigmodel.cn/api/paas/v4"
                            />
                            <span className="form-hint">智谱 AI API 服务地址</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">模型名称</label>
                            <select
                                className="form-select"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            >
                                <option value="autoglm-phone">autoglm-phone (官方 API)</option>
                                <option value="autoglm-phone-9b">autoglm-phone-9b (本地部署)</option>
                                <option value="ZhipuAI/AutoGLM-Phone-9B">ZhipuAI/AutoGLM-Phone-9B (ModelScope)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">API Key</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.apiKey}
                                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                placeholder="请输入你的 API Key"
                            />
                            <span className="form-hint">在智谱 AI 平台获取 API Key</span>
                        </div>
                    </div>

                    {/* 执行配置 */}
                    <div className="settings-section">
                        <h3 className="section-title">执行配置</h3>

                        <div className="form-group">
                            <label className="form-label">最大步数</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.maxSteps}
                                onChange={(e) => setFormData({ ...formData, maxSteps: parseInt(e.target.value) || 10 })}
                                min={1}
                                max={100}
                            />
                            <span className="form-hint">每个任务的最大执行步数 (1-100)</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">语言</label>
                            <select
                                className="form-select"
                                value={formData.lang}
                                onChange={(e) => setFormData({ ...formData, lang: e.target.value as 'cn' | 'en' })}
                            >
                                <option value="cn">中文</option>
                                <option value="en">English</option>
                            </select>
                            <span className="form-hint">系统提示词语言</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="footer-btn secondary" onClick={handleClose}>
                        取消
                    </button>
                    <button className="footer-btn primary" onClick={handleSave}>
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal
