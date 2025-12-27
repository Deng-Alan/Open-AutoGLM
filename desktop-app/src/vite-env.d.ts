/// <reference types="vite/client" />

interface Device {
    id: string
    status: string
    type: 'adb' | 'hdc'
}

interface Config {
    baseUrl: string
    model: string
    apiKey: string
    maxSteps: number
    lang: 'cn' | 'en'
}

interface TaskOutput {
    type: 'stdout' | 'stderr'
    message: string
}

interface AppData {
    memories: MemoryEntry[]
    bannedOperations: BannedOperation[]
    executionRules: ExecutionRule[]
}

interface MemoryEntry {
    id: string
    content: string
    source: 'auto' | 'manual'
    createdAt: string
    category: 'location' | 'contact' | 'preference' | 'history' | 'other'
}

interface BannedOperation {
    id: string
    type: 'app' | 'action' | 'keyword'
    value: string
    description: string
    enabled: boolean
}

interface ExecutionRule {
    id: string
    name: string
    condition: string
    action: 'pause' | 'stop' | 'notify' | 'skip'
    enabled: boolean
}

interface ElectronAPI {
    // 设备管理
    getDevices: () => Promise<Device[]>
    getScreenshot: (deviceId?: string) => Promise<string | null>
    checkAdb: () => Promise<boolean>

    // 任务管理
    runTask: (task: string) => Promise<{ code: number }>
    stopTask: () => Promise<boolean>

    // 配置管理
    getConfig: () => Promise<Config>
    saveConfig: (config: Config) => Promise<boolean>

    // 应用数据管理
    getAppData: () => Promise<AppData>
    saveAppData: (data: AppData) => Promise<boolean>

    // 事件监听
    onTaskOutput: (callback: (data: TaskOutput) => void) => void
    onTaskComplete: (callback: (data: { code: number }) => void) => void
    removeAllListeners: (channel: string) => void
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}

export { }
