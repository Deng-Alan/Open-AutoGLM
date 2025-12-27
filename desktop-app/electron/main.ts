import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'

// 开发环境下的 Vite 服务器地址
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null
let pythonProcess: ChildProcess | null = null

// Python 脚本路径
const getPythonScriptPath = () => {
    // 获取项目根目录 (desktop-app 的父目录)
    const projectRoot = path.join(__dirname, '..', '..')
    return path.join(projectRoot, 'main.py')
}

// 配置文件路径
const getConfigPath = () => {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'config.json')
}

// 加载配置
const loadConfig = (): Record<string, any> => {
    try {
        const configPath = getConfigPath()
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        }
    } catch (error) {
        console.error('加载配置失败:', error)
    }
    return {
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        model: 'autoglm-phone',
        apiKey: '',
        maxSteps: 10,
        lang: 'cn'
    }
}

// 保存配置
const saveConfig = (config: Record<string, any>) => {
    try {
        const configPath = getConfigPath()
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    } catch (error) {
        console.error('保存配置失败:', error)
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        titleBarStyle: 'hiddenInset',
        frame: true,
        backgroundColor: '#0a0a0f',
        show: false
    })

    // 窗口准备好后再显示，避免白屏
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
    })

    // 加载页面
    if (VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(VITE_DEV_SERVER_URL)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    // 处理外部链接
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// IPC 处理器

// 获取设备列表
ipcMain.handle('get-devices', async () => {
    return new Promise((resolve) => {
        const adb = spawn('adb', ['devices'], { shell: true })
        let output = ''

        adb.stdout.on('data', (data) => {
            output += data.toString()
        })

        adb.on('close', () => {
            const lines = output.split('\n').slice(1) // 跳过第一行 "List of devices attached"
            const devices = lines
                .filter(line => line.trim() && line.includes('\t'))
                .map(line => {
                    const [id, status] = line.split('\t').map(s => s.trim())
                    return { id, status, type: 'adb' }
                })
            resolve(devices)
        })

        adb.on('error', () => {
            resolve([])
        })
    })
})

// 获取屏幕截图
ipcMain.handle('get-screenshot', async (_, deviceId?: string) => {
    return new Promise((resolve) => {
        const args = deviceId ? ['-s', deviceId, 'exec-out', 'screencap', '-p'] : ['exec-out', 'screencap', '-p']
        const adb = spawn('adb', args, { shell: true })
        const chunks: Buffer[] = []

        adb.stdout.on('data', (data) => {
            chunks.push(data)
        })

        adb.on('close', (code) => {
            if (code === 0 && chunks.length > 0) {
                const buffer = Buffer.concat(chunks)
                const base64 = buffer.toString('base64')
                resolve(`data:image/png;base64,${base64}`)
            } else {
                resolve(null)
            }
        })

        adb.on('error', () => {
            resolve(null)
        })
    })
})

// 执行任务
ipcMain.handle('run-task', async (event, task: string) => {
    const config = loadConfig()
    const scriptPath = getPythonScriptPath()

    return new Promise((resolve, reject) => {
        const args = [
            scriptPath,
            '--base-url', config.baseUrl,
            '--model', config.model,
            '--apikey', config.apiKey,
            '--max-steps', config.maxSteps.toString(),
            '--lang', config.lang,
            task
        ]

        pythonProcess = spawn('python', args, {
            shell: true,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        })

        pythonProcess.stdout?.on('data', (data) => {
            const message = data.toString()
            mainWindow?.webContents.send('task-output', { type: 'stdout', message })
        })

        pythonProcess.stderr?.on('data', (data) => {
            const message = data.toString()
            mainWindow?.webContents.send('task-output', { type: 'stderr', message })
        })

        pythonProcess.on('close', (code) => {
            pythonProcess = null
            mainWindow?.webContents.send('task-complete', { code })
            resolve({ code })
        })

        pythonProcess.on('error', (error) => {
            pythonProcess = null
            reject(error)
        })
    })
})

// 停止任务
ipcMain.handle('stop-task', async () => {
    if (pythonProcess) {
        pythonProcess.kill('SIGTERM')
        pythonProcess = null
        return true
    }
    return false
})

// 获取配置
ipcMain.handle('get-config', async () => {
    return loadConfig()
})

// 保存配置
ipcMain.handle('save-config', async (_, config: Record<string, any>) => {
    saveConfig(config)
    return true
})

// 检查 ADB 是否可用
ipcMain.handle('check-adb', async () => {
    return new Promise((resolve) => {
        const adb = spawn('adb', ['version'], { shell: true })
        adb.on('close', (code) => {
            resolve(code === 0)
        })
        adb.on('error', () => {
            resolve(false)
        })
    })
})

// 应用生命周期
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill('SIGTERM')
    }
})
