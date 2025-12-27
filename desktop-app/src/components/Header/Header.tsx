import './Header.css'
import { useAppStore } from '../../stores/appStore'

function Header() {
    const { setSettingsOpen, adbAvailable } = useAppStore()

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">
                    <span className="logo-icon">🤖</span>
                    <h1 className="logo-text">AutoGLM Desktop</h1>
                </div>
                <div className="header-status">
                    <span className={`status-dot ${adbAvailable ? 'online' : 'offline'}`}></span>
                    <span className="status-text">
                        {adbAvailable ? 'ADB 就绪' : 'ADB 未连接'}
                    </span>
                </div>
            </div>
            <div className="header-right">
                <button
                    className="header-btn"
                    onClick={() => setSettingsOpen(true)}
                    title="设置"
                >
                    <span className="btn-icon">⚙️</span>
                    <span className="btn-text">设置</span>
                </button>
            </div>
        </header>
    )
}

export default Header
