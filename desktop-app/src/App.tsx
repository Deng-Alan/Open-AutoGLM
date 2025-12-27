import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import DevicePanel from './components/DevicePanel/DevicePanel'
import TaskPanel from './components/TaskPanel/TaskPanel'
import Header from './components/Header/Header'
import SettingsModal from './components/Settings/SettingsModal'
import './App.css'

function App() {
    const { setConfig, setAdbAvailable } = useAppStore()

    useEffect(() => {
        // 加载配置
        const loadConfig = async () => {
            try {
                const config = await window.electronAPI.getConfig()
                setConfig(config)
            } catch (error) {
                console.error('加载配置失败:', error)
            }
        }

        // 检查 ADB
        const checkAdb = async () => {
            try {
                const available = await window.electronAPI.checkAdb()
                setAdbAvailable(available)
            } catch (error) {
                console.error('检查 ADB 失败:', error)
                setAdbAvailable(false)
            }
        }

        loadConfig()
        checkAdb()
    }, [setConfig, setAdbAvailable])

    return (
        <div className="app">
            <Header />
            <main className="app-main">
                <DevicePanel />
                <TaskPanel />
            </main>
            <SettingsModal />
        </div>
    )
}

export default App
