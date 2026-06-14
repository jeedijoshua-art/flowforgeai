import { memo } from 'react'
import ReactFlow, {
  Background,
  ConnectionMode,
  type Edge as RFEdge,
  type Node as RFNode,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from 'reactflow'
import { InputNode, AINode, OutputNode, type SimpleNodeData } from '../nodes'
import 'reactflow/dist/style.css'

const nodeTypes = {
  inputNode: InputNode,
  aiNode: AINode,
  outputNode: OutputNode
}

const edgeTypes = {}

type FlowCanvasProps = {
  nodes: RFNode<SimpleNodeData>[]
  edges: RFEdge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  onInit: (instance: ReactFlowInstance) => void
}

function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onInit
}: FlowCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
      <ReactFlow
        style={{ width: '100%', height: '100%' }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        connectionMode={ConnectionMode.Strict}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  )
}

export default memo(FlowCanvas)
