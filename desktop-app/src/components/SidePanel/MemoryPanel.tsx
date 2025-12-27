import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { MemoryEntry } from '../../stores/appStore'
import './SidePanel.css'

function MemoryPanel() {
    const { memories, addMemory, removeMemory, clearMemories } = useAppStore()
    const [newMemory, setNewMemory] = useState('')
    const [category, setCategory] = useState<MemoryEntry['category']>('other')

    const handleAddMemory = () => {
        if (!newMemory.trim()) return
        addMemory({
            content: newMemory,
            source: 'manual',
            category
        })
        setNewMemory('')
    }

    const getCategoryIcon = (cat: MemoryEntry['category']) => {
        switch (cat) {
            case 'location': return '📍'
            case 'contact': return '👤'
            case 'preference': return '⭐'
            case 'history': return '📜'
            default: return '📝'
        }
    }

    const getCategoryLabel = (cat: MemoryEntry['category']) => {
        switch (cat) {
            case 'location': return '位置'
            case 'contact': return '联系人'
            case 'preference': return '偏好'
            case 'history': return '历史'
            default: return '其他'
        }
    }

    return (
        <div className="side-panel">
            <div className="side-panel-header">
                <h3 className="side-panel-title">
                    <span className="title-icon">🧠</span>
                    记忆
                </h3>
                <span className="item-count">{memories.length} 条</span>
            </div>

            <div className="side-panel-content">
                {/* 添加记忆 */}
                <div className="add-section">
                    <input
                        type="text"
                        className="add-input"
                        placeholder="添加新记忆..."
                        value={newMemory}
                        onChange={(e) => setNewMemory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMemory()}
                    />
                    <select
                        className="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as MemoryEntry['category'])}
                    >
                        <option value="other">其他</option>
                        <option value="location">位置</option>
                        <option value="contact">联系人</option>
                        <option value="preference">偏好</option>
                        <option value="history">历史</option>
                    </select>
                    <button className="add-btn" onClick={handleAddMemory}>
                        ➕
                    </button>
                </div>

                {/* 记忆列表 */}
                <div className="items-list">
                    {memories.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🧠</span>
                            <span className="empty-text">暂无记忆，AI 会自动提取任务中的关键信息</span>
                        </div>
                    ) : (
                        memories.map((memory) => (
                            <div key={memory.id} className={`list-item memory-item ${memory.source}`}>
                                <span className="item-icon">{getCategoryIcon(memory.category)}</span>
                                <div className="item-info">
                                    <span className="item-text">{memory.content}</span>
                                    <span className="item-meta">
                                        {getCategoryLabel(memory.category)} · {memory.source === 'auto' ? '自动' : '手动'}
                                    </span>
                                </div>
                                <button
                                    className="item-delete"
                                    onClick={() => removeMemory(memory.id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="side-panel-footer">
                <button
                    className="footer-action"
                    onClick={clearMemories}
                    disabled={memories.length === 0}
                >
                    🗑️ 清空全部
                </button>
            </div>
        </div>
    )
}

export default MemoryPanel
