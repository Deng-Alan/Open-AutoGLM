import { useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import DevicePanel from './components/DevicePanel/DevicePanel'
import TaskPanel from './components/TaskPanel/TaskPanel'
import Header from './components/Header/Header'
import SettingsModal from './components/Settings/SettingsModal'
import MemoryPanel from './components/SidePanel/MemoryPanel'
import RulesPanel from './components/SidePanel/RulesPanel'
import './App.css'

function App() {
    const { setConfig, setAdbAvailable, activePanel } = useAppStore()

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

    const renderRightPanel = () => {
        switch (activePanel) {
            case 'memory':
                return <MemoryPanel />
            case 'rules':
                return <RulesPanel />
            default:
                return <TaskPanel />
        }
    }

    return (
        <div className="app">
            <Header />
            <main className="app-main">
                <DevicePanel />
                <div className="main-content">
                    {renderRightPanel()}
                </div>
                <SideNav />
            </main>
            <SettingsModal />
        </div>
    )
}

// 侧边导航
function SideNav() {
    const { activePanel, setActivePanel } = useAppStore()

    return (
        <nav className="side-nav">
            <button
                className={`nav-btn ${activePanel === 'tasks' ? 'active' : ''}`}
                onClick={() => setActivePanel('tasks')}
                title="任务"
            >
                <span className="nav-icon">💬</span>
                <span className="nav-label">任务</span>
            </button>
            <button
                className={`nav-btn ${activePanel === 'memory' ? 'active' : ''}`}
                onClick={() => setActivePanel('memory')}
                title="记忆"
            >
                <span className="nav-icon">🧠</span>
                <span className="nav-label">记忆</span>
            </button>
            <button
                className={`nav-btn ${activePanel === 'rules' ? 'active' : ''}`}
                onClick={() => setActivePanel('rules')}
                title="规则"
            >
                <span className="nav-icon">📜</span>
                <span className="nav-label">规则</span>
            </button>
        </nav>
    )
}

export default App
