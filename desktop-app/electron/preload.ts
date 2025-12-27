import { contextBridge, ipcRenderer } from 'electron'

// 定义暴露给渲染进程的 API
const electronAPI = {
    // 设备管理
    getDevices: () => ipcRenderer.invoke('get-devices'),
    getScreenshot: (deviceId?: string) => ipcRenderer.invoke('get-screenshot', deviceId),
    checkAdb: () => ipcRenderer.invoke('check-adb'),

    // 任务管理
    runTask: (task: string) => ipcRenderer.invoke('run-task', task),
    stopTask: () => ipcRenderer.invoke('stop-task'),

    // 配置管理
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config: Record<string, any>) => ipcRenderer.invoke('save-config', config),

    // 事件监听
    onTaskOutput: (callback: (data: { type: string; message: string }) => void) => {
        ipcRenderer.on('task-output', (_, data) => callback(data))
    },
    onTaskComplete: (callback: (data: { code: number }) => void) => {
        ipcRenderer.on('task-complete', (_, data) => callback(data))
    },

    // 移除监听器
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel)
    }
}

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript 类型定义
export type ElectronAPI = typeof electronAPI
