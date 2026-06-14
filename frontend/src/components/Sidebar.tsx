import type { FC } from 'react'
import type { FlowNodeKind } from '../nodes'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  onAddNode: (kind: FlowNodeKind) => void
  isRunning: boolean
  workflows: { id: string; name: string; created_at?: string; updated_at?: string }[]
  onLoadWorkflow: (id: string) => void
  onDeleteWorkflow: (id: string) => void
  activeWorkflowId: string | null
  onNewWorkflow: () => void
}

export const Sidebar: FC<SidebarProps> = ({
  onAddNode,
  isRunning,
  workflows,
  onLoadWorkflow,
  onDeleteWorkflow,
  activeWorkflowId,
  onNewWorkflow
}) => {
  const { user, loading } = useAuth()

  return (
    <aside className="workspace-sidebar">
      {/* SECTION A: New Workflow */}
      <div className="sidebar-section new-workflow-section">
        <button
          type="button"
          className="btn primary new-workflow-btn"
          onClick={onNewWorkflow}
          disabled={isRunning}
        >
          + New Workflow
        </button>
      </div>

      {/* SECTION B: Recent Workflows */}
      <div className="sidebar-section workflows-section">
        <h3 className="section-title">
          Recent Workflows
          {user && <span className="workflows-count">{workflows.length}</span>}
        </h3>
        {loading ? (
          <p className="section-description">Loading workflows...</p>
        ) : !user ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔒</span>
            <span className="empty-state-title">Sign in required</span>
            <span className="empty-state-text">Sign in with Google to view and manage your saved workflows.</span>
          </div>
        ) : workflows.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📁</span>
            <span className="empty-state-title">No workflows yet</span>
            <span className="empty-state-text">Create your first flow by adding nodes and clicking "Save".</span>
          </div>
        ) : (
          <div className="workflow-list-container">
            <ul className="workflow-list">
              {workflows.map((wf) => (
                <li
                  key={wf.id}
                  className={`workflow-list-item ${activeWorkflowId === wf.id ? 'active' : ''}`}
                  onClick={() => onLoadWorkflow(wf.id)}
                >
                  <span className="workflow-item-name" title={wf.name}>
                    {wf.name}
                  </span>
                  <button
                    type="button"
                    className="btn delete-workflow-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteWorkflow(wf.id)
                    }}
                    disabled={isRunning}
                    aria-label={`Delete workflow ${wf.name}`}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION C: Workflow Nodes */}
      <div className="sidebar-section nodes-section">
        <h3 className="section-title">Workflow Nodes</h3>
        <p className="section-description">Select node cards to insert them.</p>
        <div className="node-grid">
          <button
            type="button"
            className="sidebar-node-btn input-node-btn"
            onClick={() => onAddNode('input')}
            disabled={isRunning}
          >
            <span className="btn-icon">📥</span>
            <div className="btn-meta">
              <span className="btn-title">Input Node</span>
              <span className="btn-subtitle">Workflow trigger</span>
            </div>
          </button>

          <button
            type="button"
            className="sidebar-node-btn ai-node-btn"
            onClick={() => onAddNode('ai')}
            disabled={isRunning}
          >
            <span className="btn-icon">✨</span>
            <div className="btn-meta">
              <span className="btn-title">AI Node</span>
              <span className="btn-subtitle">Gemini 2.5 Flash</span>
            </div>
          </button>

          <button
            type="button"
            className="sidebar-node-btn output-node-btn"
            onClick={() => onAddNode('output')}
            disabled={isRunning}
          >
            <span className="btn-icon">📤</span>
            <div className="btn-meta">
              <span className="btn-title">Output Node</span>
              <span className="btn-subtitle">Live output details</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}

