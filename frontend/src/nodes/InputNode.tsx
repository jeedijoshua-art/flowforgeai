import { useCallback, type ChangeEvent } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from 'reactflow'
import type { SimpleNodeData } from './types'

export default function InputNode({ id, data, selected, isConnectable }: NodeProps<SimpleNodeData>) {
  const { setNodes, deleteElements } = useReactFlow()

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              inputText: e.target.value
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
    <div className={`custom-node input-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="node-header-title">
          <span className="node-icon">📥</span>
          <span className="node-title">{data.label}</span>
        </div>
        <div className="node-header-actions">
          <span className="node-badge trigger-badge">Trigger</span>
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
          placeholder="Enter input text here..."
          value={data.inputText ?? ''}
          onChange={handleTextChange}
        />
      </div>

      <Handle
        id="input-source-0"
        type="source"
        position={Position.Right}
        style={{ top: '50%' }}
        className="node-handle source-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="input-source-1"
        type="source"
        position={Position.Bottom}
        style={{ left: '50%' }}
        className="node-handle source-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="input-source-left"
        type="source"
        position={Position.Left}
        style={{ top: '50%' }}
        className="node-handle source-handle"
        isConnectable={isConnectable ?? true}
      />
      <Handle
        id="input-source-top"
        type="source"
        position={Position.Top}
        style={{ left: '50%' }}
        className="node-handle source-handle"
        isConnectable={isConnectable ?? true}
      />
    </div>
  )
}
