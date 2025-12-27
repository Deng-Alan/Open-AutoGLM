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

// 任务类型
interface Task {
    id: string
    content: string
    status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
    createdAt: Date
    completedAt?: Date
}

// 禁止操作规则类型
interface BannedOperation {
    id: string
    type: 'app' | 'action' | 'keyword'
    value: string
    description: string
    enabled: boolean
}

// 记忆条目类型
interface MemoryEntry {
    id: string
    content: string
    source: 'auto' | 'manual'
    createdAt: Date
    category: 'location' | 'contact' | 'preference' | 'history' | 'other'
}

// 执行规则类型
interface ExecutionRule {
    id: string
    name: string
    condition: string
    action: 'pause' | 'stop' | 'notify' | 'skip'
    enabled: boolean
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
    currentTask: Task | null
    taskQueue: Task[]
    logs: LogEntry[]

    // 配置状态
    config: Config
    isSettingsOpen: boolean

    // 高级功能
    bannedOperations: BannedOperation[]
    memories: MemoryEntry[]
    executionRules: ExecutionRule[]

    // UI 状态
    activePanel: 'tasks' | 'memory' | 'rules'

    // 设备 Actions
    setDevices: (devices: Device[]) => void
    selectDevice: (deviceId: string | null) => void
    setLoadingDevices: (loading: boolean) => void
    setAdbAvailable: (available: boolean) => void

    // 截图 Actions
    setScreenshot: (screenshot: string | null) => void
    setLoadingScreenshot: (loading: boolean) => void

    // 任务 Actions
    setIsRunning: (running: boolean) => void
    addTaskToQueue: (content: string) => void
    removeTaskFromQueue: (taskId: string) => void
    reorderTaskQueue: (fromIndex: number, toIndex: number) => void
    startNextTask: () => Task | null
    completeCurrentTask: (status: 'completed' | 'failed' | 'stopped') => void
    clearTaskQueue: () => void

    // 日志 Actions
    addLog: (type: LogEntry['type'], message: string) => void
    clearLogs: () => void

    // 配置 Actions
    setConfig: (config: Partial<Config>) => void
    setSettingsOpen: (open: boolean) => void

    // 禁止操作 Actions
    addBannedOperation: (op: Omit<BannedOperation, 'id'>) => void
    removeBannedOperation: (id: string) => void
    toggleBannedOperation: (id: string) => void

    // 记忆 Actions
    addMemory: (memory: Omit<MemoryEntry, 'id' | 'createdAt'>) => void
    removeMemory: (id: string) => void
    clearMemories: () => void

    // 规则 Actions
    addExecutionRule: (rule: Omit<ExecutionRule, 'id'>) => void
    removeExecutionRule: (id: string) => void
    toggleExecutionRule: (id: string) => void

    // UI Actions
    setActivePanel: (panel: 'tasks' | 'memory' | 'rules') => void
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

// 默认执行规则
const defaultExecutionRules: ExecutionRule[] = [
    {
        id: 'rule-captcha',
        name: '遇到验证码时暂停',
        condition: '检测到验证码或图形验证',
        action: 'pause',
        enabled: true
    },
    {
        id: 'rule-login',
        name: '遇到登录页面时等待',
        condition: '检测到登录页面或需要输入密码',
        action: 'pause',
        enabled: true
    },
    {
        id: 'rule-payment',
        name: '支付前确认',
        condition: '检测到支付、付款、确认订单',
        action: 'pause',
        enabled: true
    },
    {
        id: 'rule-error',
        name: '连续失败时停止',
        condition: '连续3次操作失败',
        action: 'stop',
        enabled: true
    }
]

// 默认禁止操作
const defaultBannedOperations: BannedOperation[] = [
    {
        id: 'ban-alipay',
        type: 'app',
        value: '支付宝',
        description: '禁止启动支付宝',
        enabled: false
    },
    {
        id: 'ban-bank',
        type: 'keyword',
        value: '银行',
        description: '禁止启动任何银行类应用',
        enabled: false
    },
    {
        id: 'ban-delete',
        type: 'action',
        value: 'delete',
        description: '禁止删除操作',
        enabled: false
    }
]

// 创建状态存储
export const useAppStore = create<AppState>((set, get) => ({
    // 初始状态
    devices: [],
    selectedDeviceId: null,
    isLoadingDevices: false,
    adbAvailable: false,

    screenshot: null,
    isLoadingScreenshot: false,

    isRunning: false,
    currentTask: null,
    taskQueue: [],
    logs: [],

    config: defaultConfig,
    isSettingsOpen: false,

    bannedOperations: defaultBannedOperations,
    memories: [],
    executionRules: defaultExecutionRules,

    activePanel: 'tasks',

    // 设备 Actions
    setDevices: (devices) => set({ devices }),
    selectDevice: (deviceId) => set({ selectedDeviceId: deviceId }),
    setLoadingDevices: (loading) => set({ isLoadingDevices: loading }),
    setAdbAvailable: (available) => set({ adbAvailable: available }),

    // 截图 Actions
    setScreenshot: (screenshot) => set({ screenshot }),
    setLoadingScreenshot: (loading) => set({ isLoadingScreenshot: loading }),

    // 任务 Actions
    setIsRunning: (running) => set({ isRunning: running }),

    addTaskToQueue: (content) => {
        const newTask: Task = {
            id: generateId(),
            content,
            status: 'pending',
            createdAt: new Date()
        }
        set((state) => ({ taskQueue: [...state.taskQueue, newTask] }))
    },

    removeTaskFromQueue: (taskId) => {
        set((state) => ({
            taskQueue: state.taskQueue.filter((t) => t.id !== taskId)
        }))
    },

    reorderTaskQueue: (fromIndex, toIndex) => {
        set((state) => {
            const newQueue = [...state.taskQueue]
            const [removed] = newQueue.splice(fromIndex, 1)
            newQueue.splice(toIndex, 0, removed)
            return { taskQueue: newQueue }
        })
    },

    startNextTask: () => {
        const state = get()
        if (state.taskQueue.length === 0) return null

        const [nextTask, ...rest] = state.taskQueue
        const runningTask: Task = { ...nextTask, status: 'running' }

        set({
            currentTask: runningTask,
            taskQueue: rest,
            isRunning: true
        })

        return runningTask
    },

    completeCurrentTask: (status) => {
        set((state) => ({
            currentTask: state.currentTask
                ? { ...state.currentTask, status, completedAt: new Date() }
                : null,
            isRunning: false
        }))
    },

    clearTaskQueue: () => set({ taskQueue: [] }),

    // 日志 Actions
    addLog: (type, message) => set((state) => ({
        logs: [...state.logs, {
            id: generateId(),
            type,
            message,
            timestamp: new Date()
        }]
    })),

    clearLogs: () => set({ logs: [] }),

    // 配置 Actions
    setConfig: (config) => set((state) => ({
        config: { ...state.config, ...config }
    })),
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),

    // 禁止操作 Actions
    addBannedOperation: (op) => {
        const newOp: BannedOperation = { ...op, id: generateId() }
        set((state) => ({
            bannedOperations: [...state.bannedOperations, newOp]
        }))
    },

    removeBannedOperation: (id) => {
        set((state) => ({
            bannedOperations: state.bannedOperations.filter((o) => o.id !== id)
        }))
    },

    toggleBannedOperation: (id) => {
        set((state) => ({
            bannedOperations: state.bannedOperations.map((o) =>
                o.id === id ? { ...o, enabled: !o.enabled } : o
            )
        }))
    },

    // 记忆 Actions
    addMemory: (memory) => {
        const newMemory: MemoryEntry = {
            ...memory,
            id: generateId(),
            createdAt: new Date()
        }
        set((state) => ({
            memories: [...state.memories, newMemory]
        }))
    },

    removeMemory: (id) => {
        set((state) => ({
            memories: state.memories.filter((m) => m.id !== id)
        }))
    },

    clearMemories: () => set({ memories: [] }),

    // 规则 Actions
    addExecutionRule: (rule) => {
        const newRule: ExecutionRule = { ...rule, id: generateId() }
        set((state) => ({
            executionRules: [...state.executionRules, newRule]
        }))
    },

    removeExecutionRule: (id) => {
        set((state) => ({
            executionRules: state.executionRules.filter((r) => r.id !== id)
        }))
    },

    toggleExecutionRule: (id) => {
        set((state) => ({
            executionRules: state.executionRules.map((r) =>
                r.id === id ? { ...r, enabled: !r.enabled } : r
            )
        }))
    },

    // UI Actions
    setActivePanel: (panel) => set({ activePanel: panel })
}))

// 导出类型
export type { Task, BannedOperation, MemoryEntry, ExecutionRule, LogEntry, Config, Device }
