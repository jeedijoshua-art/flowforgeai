import { useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from 'reactflow'
import type { SimpleNodeData } from './types'

export default function OutputNode({ id, data, selected, isConnectable }: NodeProps<SimpleNodeData>) {
  const { deleteElements } = useReactFlow()

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] })
  }, [deleteElements, id])

  return (
    <div className={`custom-node output-node ${selected ? 'selected' : ''}`}>
      <Handle
        id="output-target-0"
        type="target"
        position={Position.Left}
        style={{ top: '50%' }}
        className="node-handle target-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="output-target-1"
        type="target"
        position={Position.Top}
        style={{ left: '50%' }}
        className="node-handle target-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="output-target-right"
        type="target"
        position={Position.Right}
        style={{ top: '50%' }}
        className="node-handle target-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="output-target-bottom"
        type="target"
        position={Position.Bottom}
        style={{ left: '50%' }}
        className="node-handle target-handle"
        isConnectable={isConnectable ?? true}
      />

      <div className="node-header">
        <div className="node-header-title">
          <span className="node-icon">📤</span>
          <span className="node-title">{data.label}</span>
        </div>
        <div className="node-header-actions">
          <span className="node-badge output-badge">Output</span>
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
          className="node-textarea readonly nodrag nowheel"
          placeholder="AI response will appear here after execution..."
          value={data.outputText ?? ''}
          readOnly
        />
      </div>
    </div>
  )
}
