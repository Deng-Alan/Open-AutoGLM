import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { BannedOperation, ExecutionRule } from '../../stores/appStore'
import './SidePanel.css'

function RulesPanel() {
    const {
        bannedOperations,
        executionRules,
        addBannedOperation,
        removeBannedOperation,
        toggleBannedOperation,
        addExecutionRule,
        removeExecutionRule,
        toggleExecutionRule
    } = useAppStore()

    const [activeTab, setActiveTab] = useState<'banned' | 'rules'>('banned')
    const [newBanType, setNewBanType] = useState<BannedOperation['type']>('app')
    const [newBanValue, setNewBanValue] = useState('')
    const [newRuleName, setNewRuleName] = useState('')
    const [newRuleCondition, setNewRuleCondition] = useState('')
    const [newRuleAction, setNewRuleAction] = useState<ExecutionRule['action']>('pause')

    const handleAddBan = () => {
        if (!newBanValue.trim()) return
        addBannedOperation({
            type: newBanType,
            value: newBanValue,
            description: `禁止${newBanType === 'app' ? '启动' : newBanType === 'action' ? '执行' : '包含'}${newBanValue}`,
            enabled: true
        })
        setNewBanValue('')
    }

    const handleAddRule = () => {
        if (!newRuleName.trim() || !newRuleCondition.trim()) return
        addExecutionRule({
            name: newRuleName,
            condition: newRuleCondition,
            action: newRuleAction,
            enabled: true
        })
        setNewRuleName('')
        setNewRuleCondition('')
    }

    const getBanTypeIcon = (type: BannedOperation['type']) => {
        switch (type) {
            case 'app': return '📱'
            case 'action': return '🚫'
            case 'keyword': return '🔤'
        }
    }

    const getActionLabel = (action: ExecutionRule['action']) => {
        switch (action) {
            case 'pause': return '暂停'
            case 'stop': return '停止'
            case 'notify': return '通知'
            case 'skip': return '跳过'
        }
    }

    return (
        <div className="side-panel">
            <div className="side-panel-header">
                <h3 className="side-panel-title">
                    <span className="title-icon">📜</span>
                    规则
                </h3>
            </div>

            {/* 标签切换 */}
            <div className="tab-bar">
                <button
                    className={`tab-btn ${activeTab === 'banned' ? 'active' : ''}`}
                    onClick={() => setActiveTab('banned')}
                >
                    🚫 禁止操作
                </button>
                <button
                    className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rules')}
                >
                    ⚙️ 执行规则
                </button>
            </div>

            <div className="side-panel-content">
                {activeTab === 'banned' ? (
                    <>
                        {/* 添加禁止操作 */}
                        <div className="add-section">
                            <select
                                className="type-select"
                                value={newBanType}
                                onChange={(e) => setNewBanType(e.target.value as BannedOperation['type'])}
                            >
                                <option value="app">应用</option>
                                <option value="action">操作</option>
                                <option value="keyword">关键词</option>
                            </select>
                            <input
                                type="text"
                                className="add-input flex-1"
                                placeholder={newBanType === 'app' ? '应用名称' : newBanType === 'action' ? '操作类型' : '关键词'}
                                value={newBanValue}
                                onChange={(e) => setNewBanValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddBan()}
                            />
                            <button className="add-btn" onClick={handleAddBan}>
                                ➕
                            </button>
                        </div>

                        {/* 禁止操作列表 */}
                        <div className="items-list">
                            {bannedOperations.map((op) => (
                                <div key={op.id} className={`list-item ${op.enabled ? 'enabled' : 'disabled'}`}>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleBannedOperation(op.id)}
                                    >
                                        {op.enabled ? '✅' : '⬜'}
                                    </button>
                                    <span className="item-icon">{getBanTypeIcon(op.type)}</span>
                                    <div className="item-info">
                                        <span className="item-text">{op.value}</span>
                                        <span className="item-meta">{op.description}</span>
                                    </div>
                                    <button
                                        className="item-delete"
                                        onClick={() => removeBannedOperation(op.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* 添加执行规则 */}
                        <div className="add-section column">
                            <input
                                type="text"
                                className="add-input"
                                placeholder="规则名称"
                                value={newRuleName}
                                onChange={(e) => setNewRuleName(e.target.value)}
                            />
                            <input
                                type="text"
                                className="add-input"
                                placeholder="触发条件（如：检测到验证码）"
                                value={newRuleCondition}
                                onChange={(e) => setNewRuleCondition(e.target.value)}
                            />
                            <div className="add-row">
                                <select
                                    className="action-select"
                                    value={newRuleAction}
                                    onChange={(e) => setNewRuleAction(e.target.value as ExecutionRule['action'])}
                                >
                                    <option value="pause">暂停</option>
                                    <option value="stop">停止</option>
                                    <option value="notify">通知</option>
                                    <option value="skip">跳过</option>
                                </select>
                                <button className="add-btn primary" onClick={handleAddRule}>
                                    添加规则
                                </button>
                            </div>
                        </div>

                        {/* 执行规则列表 */}
                        <div className="items-list">
                            {executionRules.map((rule) => (
                                <div key={rule.id} className={`list-item ${rule.enabled ? 'enabled' : 'disabled'}`}>
                                    <button
                                        className="toggle-btn"
                                        onClick={() => toggleExecutionRule(rule.id)}
                                    >
                                        {rule.enabled ? '✅' : '⬜'}
                                    </button>
                                    <div className="item-info">
                                        <span className="item-text">{rule.name}</span>
                                        <span className="item-meta">
                                            {rule.condition} → {getActionLabel(rule.action)}
                                        </span>
                                    </div>
                                    <button
                                        className="item-delete"
                                        onClick={() => removeExecutionRule(rule.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default RulesPanel
