import { useCallback, type ChangeEvent } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from 'reactflow'
import type { SimpleNodeData } from './types'

export default function AINode({ id, data, selected, isConnectable }: NodeProps<SimpleNodeData>) {
  const { setNodes, deleteElements } = useReactFlow()

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              promptText: e.target.value
            }
          }
        }
        return node
      })
    )
  }, [id, setNodes])

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] })
  }, [deleteElements, id])

  return (
    <div className={`custom-node ai-node ${selected ? 'selected' : ''}`}>
      <Handle
        id="ai-target-0"
        type="target"
        position={Position.Left}
        style={{ top: '50%' }}
        className="node-handle target-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="ai-target-1"
        type="target"
        position={Position.Top}
        style={{ left: '50%' }}
        className="node-handle target-handle"
        isConnectable={isConnectable ?? true}
      />

      <div className="node-header">
        <div className="node-header-title">
          <span className="node-icon">✨</span>
          <span className="node-title">{data.label}</span>
        </div>
        <div className="node-header-actions">
          <span className="node-badge model-badge">Gemini 2.5 Flash</span>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${data.label}`}
            title="Delete node"
            className="node-delete-btn"
          >
            ×
          </button>
        </div>
      </div>
      <div className="node-body">
        <textarea
          className="node-textarea nodrag nowheel"
          placeholder="Enter prompt instructions..."
          value={data.promptText ?? ''}
          onChange={handleTextChange}
        />
      </div>

      <Handle
        id="ai-source-0"
        type="source"
        position={Position.Right}
        style={{ top: '50%' }}
        className="node-handle source-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="ai-source-1"
        type="source"
        position={Position.Bottom}
        style={{ left: '50%' }}
        className="node-handle source-handle"
        isConnectable={isConnectable ?? true}
      />
    </div>
  )
}
