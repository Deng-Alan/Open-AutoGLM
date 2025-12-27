import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/appStore'
import './TaskPanel.css'

function TaskPanel() {
    const {
        isRunning,
        currentTask,
        logs,
        selectedDeviceId,
        config,
        setIsRunning,
        setCurrentTask,
        addLog,
        clearLogs
    } = useAppStore()

    const [taskInput, setTaskInput] = useState('')
    const logsEndRef = useRef<HTMLDivElement>(null)

    // 自动滚动到底部
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    // 监听任务输出
    useEffect(() => {
        const handleOutput = (data: { type: string; message: string }) => {
            const message = data.message.trim()
            if (!message) return

            // 解析输出类型
            if (message.includes('💭') || message.includes('思考')) {
                addLog('thinking', message)
            } else if (message.includes('🎯') || message.includes('动作')) {
                addLog('action', message)
            } else if (message.includes('✅') || message.includes('成功')) {
                addLog('success', message)
            } else if (message.includes('❌') || message.includes('失败') || data.type === 'stderr') {
                addLog('error', message)
            } else {
                addLog('info', message)
            }
        }

        const handleComplete = (data: { code: number }) => {
            setIsRunning(false)
            if (data.code === 0) {
                addLog('success', '✅ 任务执行完成')
            } else {
                addLog('error', `❌ 任务执行失败 (退出码: ${data.code})`)
            }
        }

        window.electronAPI.onTaskOutput(handleOutput)
        window.electronAPI.onTaskComplete(handleComplete)

        return () => {
            window.electronAPI.removeAllListeners('task-output')
            window.electronAPI.removeAllListeners('task-complete')
        }
    }, [addLog, setIsRunning])

    // 执行任务
    const runTask = async () => {
        if (!taskInput.trim() || isRunning) return

        if (!config.apiKey) {
            addLog('error', '❌ 请先在设置中配置 API Key')
            return
        }

        if (!selectedDeviceId) {
            addLog('error', '❌ 请先连接设备')
            return
        }

        clearLogs()
        setCurrentTask(taskInput)
        setIsRunning(true)
        addLog('info', `🚀 开始执行任务: ${taskInput}`)

        try {
            await window.electronAPI.runTask(taskInput)
        } catch (error) {
            addLog('error', `❌ 执行出错: ${error}`)
            setIsRunning(false)
        }
    }

    // 停止任务
    const stopTask = async () => {
        try {
            await window.electronAPI.stopTask()
            addLog('info', '⏹️ 任务已停止')
            setIsRunning(false)
        } catch (error) {
            console.error('停止任务失败:', error)
        }
    }

    // 处理回车提交
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            runTask()
        }
    }

    // 获取日志图标
    const getLogIcon = (type: string) => {
        switch (type) {
            case 'thinking': return '💭'
            case 'action': return '🎯'
            case 'success': return '✅'
            case 'error': return '❌'
            default: return '📝'
        }
    }

    return (
        <div className="task-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="panel-icon">💬</span>
                    任务控制
                </h2>
                {isRunning && (
                    <div className="running-indicator">
                        <span className="running-dot"></span>
                        <span className="running-text">执行中...</span>
                    </div>
                )}
            </div>

            {/* 任务输入 */}
            <div className="task-input-section">
                <textarea
                    className="task-input"
                    placeholder="请输入要执行的任务，例如：打开微信给文件传输助手发送你好"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isRunning}
                    rows={3}
                />
                <div className="task-actions">
                    <button
                        className="action-btn primary"
                        onClick={runTask}
                        disabled={isRunning || !taskInput.trim()}
                    >
                        <span className="btn-icon">▶️</span>
                        <span className="btn-text">执行任务</span>
                    </button>
                    <button
                        className="action-btn danger"
                        onClick={stopTask}
                        disabled={!isRunning}
                    >
                        <span className="btn-icon">⏹️</span>
                        <span className="btn-text">停止</span>
                    </button>
                    <button
                        className="action-btn secondary"
                        onClick={clearLogs}
                        disabled={isRunning}
                    >
                        <span className="btn-icon">🗑️</span>
                        <span className="btn-text">清空日志</span>
                    </button>
                </div>
            </div>

            {/* 快捷任务 */}
            <div className="quick-tasks">
                <span className="quick-label">快捷任务:</span>
                <div className="quick-btns">
                    <button
                        className="quick-btn"
                        onClick={() => setTaskInput('打开微信')}
                        disabled={isRunning}
                    >
                        微信
                    </button>
                    <button
                        className="quick-btn"
                        onClick={() => setTaskInput('打开淘宝搜索手机')}
                        disabled={isRunning}
                    >
                        淘宝搜索
                    </button>
                    <button
                        className="quick-btn"
                        onClick={() => setTaskInput('打开抖音')}
                        disabled={isRunning}
                    >
                        抖音
                    </button>
                    <button
                        className="quick-btn"
                        onClick={() => setTaskInput('返回桌面')}
                        disabled={isRunning}
                    >
                        返回桌面
                    </button>
                </div>
            </div>

            {/* 执行日志 */}
            <div className="log-section">
                <div className="log-header">
                    <span className="log-title">📝 执行日志</span>
                    <span className="log-count">{logs.length} 条</span>
                </div>
                <div className="log-container">
                    {logs.length === 0 ? (
                        <div className="log-empty">
                            <span className="empty-icon">📋</span>
                            <span className="empty-text">暂无日志，执行任务后这里会显示详细信息</span>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className={`log-entry log-${log.type}`}>
                                <span className="log-icon">{getLogIcon(log.type)}</span>
                                <span className="log-time">
                                    {log.timestamp.toLocaleTimeString('zh-CN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </span>
                                <span className="log-message">{log.message}</span>
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    )
}

export default TaskPanel
