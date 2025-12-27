import { useEffect, useCallback } from 'react'
import { useAppStore } from '../../stores/appStore'
import './DevicePanel.css'

function DevicePanel() {
    const {
        devices,
        selectedDeviceId,
        isLoadingDevices,
        screenshot,
        isLoadingScreenshot,
        setDevices,
        selectDevice,
        setLoadingDevices,
        setScreenshot,
        setLoadingScreenshot
    } = useAppStore()

    // 刷新设备列表
    const refreshDevices = useCallback(async () => {
        setLoadingDevices(true)
        try {
            const deviceList = await window.electronAPI.getDevices()
            setDevices(deviceList)
            // 如果只有一个设备，自动选中
            if (deviceList.length === 1 && !selectedDeviceId) {
                selectDevice(deviceList[0].id)
            }
        } catch (error) {
            console.error('获取设备列表失败:', error)
        } finally {
            setLoadingDevices(false)
        }
    }, [setDevices, selectDevice, setLoadingDevices, selectedDeviceId])

    // 刷新截图
    const refreshScreenshot = useCallback(async () => {
        if (!selectedDeviceId && devices.length === 0) return

        setLoadingScreenshot(true)
        try {
            const imageData = await window.electronAPI.getScreenshot(selectedDeviceId || undefined)
            setScreenshot(imageData)
        } catch (error) {
            console.error('获取截图失败:', error)
        } finally {
            setLoadingScreenshot(false)
        }
    }, [selectedDeviceId, devices.length, setScreenshot, setLoadingScreenshot])

    // 初始加载
    useEffect(() => {
        refreshDevices()
    }, [refreshDevices])

    // 选中设备后自动刷新截图
    useEffect(() => {
        if (selectedDeviceId) {
            refreshScreenshot()
        }
    }, [selectedDeviceId, refreshScreenshot])

    // 自动刷新截图
    useEffect(() => {
        if (!selectedDeviceId) return

        const interval = setInterval(() => {
            refreshScreenshot()
        }, 3000) // 每3秒刷新一次

        return () => clearInterval(interval)
    }, [selectedDeviceId, refreshScreenshot])

    return (
        <div className="device-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="panel-icon">📱</span>
                    设备预览
                </h2>
                <div className="panel-actions">
                    <button
                        className="action-btn"
                        onClick={refreshDevices}
                        disabled={isLoadingDevices}
                        title="刷新设备"
                    >
                        <span className={`btn-icon ${isLoadingDevices ? 'animate-spin' : ''}`}>🔄</span>
                    </button>
                    <button
                        className="action-btn"
                        onClick={refreshScreenshot}
                        disabled={isLoadingScreenshot || !selectedDeviceId}
                        title="刷新截图"
                    >
                        <span className={`btn-icon ${isLoadingScreenshot ? 'animate-pulse' : ''}`}>📷</span>
                    </button>
                </div>
            </div>

            {/* 设备选择器 */}
            <div className="device-selector">
                {devices.length === 0 ? (
                    <div className="no-devices">
                        <span className="no-devices-icon">📵</span>
                        <span className="no-devices-text">未检测到设备</span>
                        <button className="refresh-btn" onClick={refreshDevices}>
                            点击刷新
                        </button>
                    </div>
                ) : (
                    <select
                        className="device-select"
                        value={selectedDeviceId || ''}
                        onChange={(e) => selectDevice(e.target.value || null)}
                    >
                        <option value="">选择设备...</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.id} ({device.status === 'device' ? '在线' : device.status})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* 截图预览 */}
            <div className="screenshot-container">
                {screenshot ? (
                    <img
                        src={screenshot}
                        alt="手机屏幕"
                        className="screenshot-image"
                    />
                ) : (
                    <div className="screenshot-placeholder">
                        {isLoadingScreenshot ? (
                            <>
                                <span className="placeholder-icon animate-pulse">📱</span>
                                <span className="placeholder-text">正在加载...</span>
                            </>
                        ) : (
                            <>
                                <span className="placeholder-icon">📱</span>
                                <span className="placeholder-text">
                                    {selectedDeviceId ? '点击刷新获取截图' : '请先选择设备'}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 设备信息 */}
            {selectedDeviceId && (
                <div className="device-info">
                    <span className="device-id">设备: {selectedDeviceId}</span>
                    <span className="device-status online">● 已连接</span>
                </div>
            )}
        </div>
    )
}

export default DevicePanel
