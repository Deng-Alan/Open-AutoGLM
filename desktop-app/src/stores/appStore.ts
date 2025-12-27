import { create } from 'zustand'

// 设备信息类型
interface Device {
    id: string
    status: string
    type: 'adb' | 'hdc'
}

// 配置类型
interface Config {
    baseUrl: string
    model: string
    apiKey: string
    maxSteps: number
    lang: 'cn' | 'en'
}

// 日志条目类型
interface LogEntry {
    id: string
    type: 'thinking' | 'action' | 'success' | 'error' | 'info'
    message: string
    timestamp: Date
}

// 应用状态
interface AppState {
    // 设备状态
    devices: Device[]
    selectedDeviceId: string | null
    isLoadingDevices: boolean
    adbAvailable: boolean

    // 截图状态
    screenshot: string | null
    isLoadingScreenshot: boolean

    // 任务状态
    isRunning: boolean
    currentTask: string
    logs: LogEntry[]

    // 配置状态
    config: Config
    isSettingsOpen: boolean

    // Actions
    setDevices: (devices: Device[]) => void
    selectDevice: (deviceId: string | null) => void
    setLoadingDevices: (loading: boolean) => void
    setAdbAvailable: (available: boolean) => void

    setScreenshot: (screenshot: string | null) => void
    setLoadingScreenshot: (loading: boolean) => void

    setIsRunning: (running: boolean) => void
    setCurrentTask: (task: string) => void
    addLog: (type: LogEntry['type'], message: string) => void
    clearLogs: () => void

    setConfig: (config: Partial<Config>) => void
    setSettingsOpen: (open: boolean) => void
}

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// 默认配置
const defaultConfig: Config = {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'autoglm-phone',
    apiKey: '',
    maxSteps: 10,
    lang: 'cn'
}

// 创建状态存储
export const useAppStore = create<AppState>((set) => ({
    // 初始状态
    devices: [],
    selectedDeviceId: null,
    isLoadingDevices: false,
    adbAvailable: false,

    screenshot: null,
    isLoadingScreenshot: false,

    isRunning: false,
    currentTask: '',
    logs: [],

    config: defaultConfig,
    isSettingsOpen: false,

    // Actions
    setDevices: (devices) => set({ devices }),
    selectDevice: (deviceId) => set({ selectedDeviceId: deviceId }),
    setLoadingDevices: (loading) => set({ isLoadingDevices: loading }),
    setAdbAvailable: (available) => set({ adbAvailable: available }),

    setScreenshot: (screenshot) => set({ screenshot }),
    setLoadingScreenshot: (loading) => set({ isLoadingScreenshot: loading }),

    setIsRunning: (running) => set({ isRunning: running }),
    setCurrentTask: (task) => set({ currentTask: task }),
    addLog: (type, message) => set((state) => ({
        logs: [...state.logs, {
            id: generateId(),
            type,
            message,
            timestamp: new Date()
        }]
    })),
    clearLogs: () => set({ logs: [] }),

    setConfig: (config) => set((state) => ({
        config: { ...state.config, ...config }
    })),
    setSettingsOpen: (open) => set({ isSettingsOpen: open })
}))
