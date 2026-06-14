import { useCallback, useRef, useState, useEffect, type FC } from 'react'
import { addEdge, useEdgesState, useNodesState, type Connection, type Edge as RFEdge, type Node as RFNode, type ReactFlowInstance } from 'reactflow'
import FlowCanvas from './canvas/FlowCanvas'
import type { SimpleNodeData, FlowNodeKind } from './nodes'
import { generateAIResponse } from './services/aiService'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { LandingPage } from './components/LandingPage'
import { PlatformWorkspace } from './components/PlatformWorkspace'
import { useAuth } from './context/AuthContext'
import { platformModules } from './config/platform.config'
import {
  saveWorkflow,
  loadWorkflow,
  listWorkflows,
  deleteWorkflow,
  type SaveWorkflowInput
} from './services/workflowService'
import './App.css'

const initialNodes: RFNode<SimpleNodeData>[] = [
  {
    id: '1',
    type: 'inputNode',
    data: { label: 'Input Node', kind: 'input', inputText: 'Select this node to write input text.' },
    position: { x: 0, y: 50 }
  },
  {
    id: '2',
    type: 'aiNode',
    data: { label: 'AI Node', kind: 'ai', promptText: 'Translate the input text to Spanish.' },
    position: { x: 240, y: 50 }
  },
  {
    id: '3',
    type: 'outputNode',
    data: { label: 'Output Node', kind: 'output', outputText: '' },
    position: { x: 480, y: 50 }
  }
]

const initialEdges: RFEdge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' }
]

const cleanNode = (node: RFNode<SimpleNodeData>) => ({
  id: node.id,
  type: node.type,
  position: { x: Math.round(node.position?.x ?? 0), y: Math.round(node.position?.y ?? 0) },
  data: {
    label: node.data?.label,
    kind: node.data?.kind,
    inputText: node.data?.inputText,
    promptText: node.data?.promptText,
    outputText: node.data?.outputText,
  }
})

const cleanEdge = (edge: RFEdge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  animated: edge.animated,
})

const App: FC = () => {
  const { user } = useAuth()

  // Simple path routing state
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname
    // Clean ?launch=workflow from the URL and map to /workflow-studio
    const params = new URLSearchParams(window.location.search)
    if (params.get('launch') === 'workflow') {
      window.history.replaceState({}, '', '/workflow-studio')
      return '/workflow-studio'
    }
    return path
  })

  // Navigate helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light' | 'system') || 'system'
  })

  // Sync document.title whenever the current route changes
  useEffect(() => {
    if (currentPath === '/workflow-studio') {
      const workflowModule = platformModules.find(m => m.id === 'workflow-studio')
      document.title = workflowModule?.pageTitle ?? 'NodeCraft AI | Visual Workflow Builder'
    } else if (currentPath === '/platform') {
      document.title = 'FlowForge AI Workspace'
    } else if (currentPath === '/knowledge-hub') {
      document.title = 'Knowledge Hub | Gnosis'
    } else {
      document.title = 'FlowForge OS | AI Operating System'
    }
  }, [currentPath])

  // Apply theme when local state changes
  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light')
    }
  }, [theme])

  // Listen to prefers-color-scheme change when system theme is active
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  const [nodes, setNodes, onNodesChange] = useNodesState<SimpleNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>(initialEdges)
  const [isRunning, setIsRunning] = useState(false)
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const nextId = useRef(4)
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null)

  // Workflows, notification, and save states
  const [workflows, setWorkflows] = useState<{ id: string; name: string; created_at?: string; updated_at?: string }[]>([])
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState<string>('Untitled Workflow')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Refs for change tracking, database syncing, and queueing
  const lastSavedWorkflowRef = useRef<{ name: string; nodes: RFNode<SimpleNodeData>[]; edges: RFEdge[] } | null>(null)
  const isSavingRef = useRef<boolean>(false)
  const pendingSaveRef = useRef<{ id?: string; name: string; nodes: RFNode<SimpleNodeData>[]; edges: RFEdge[] } | null>(null)
  const executeDbSaveRef = useRef<((data: { id?: string; name: string; nodes: RFNode<SimpleNodeData>[]; edges: RFEdge[] }) => Promise<void>) | null>(null)

  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      setWorkflows([])
      return
    }
    try {
      const list = await listWorkflows()
      setWorkflows(list)
      if (list.length === 0) {
        setActiveWorkflowId(null)
        setWorkflowName('Untitled Workflow')
      }
    } catch (err) {
      console.error('Error fetching workflows:', err)
    }
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkflows()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchWorkflows])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Reset state on sign-out
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setActiveWorkflowId(null)
        setWorkflowName('Untitled Workflow')
        setNodes(initialNodes.map(n => ({ ...n, data: { ...n.data } })))
        setEdges(initialEdges.map(e => ({ ...e })))
        setSaveStatus('idle')
        lastSavedWorkflowRef.current = null
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [user, setNodes, setEdges])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((currentEdges) => addEdge(connection, currentEdges))
  }, [setEdges])

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance
    instance.fitView()
  }, [])

  const handleZoomIn = useCallback(() => {
    flowInstanceRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    flowInstanceRef.current?.zoomOut()
  }, [])

  const handleFitView = useCallback(() => {
    flowInstanceRef.current?.fitView()
  }, [])

  const handleAddNode = useCallback((kind: FlowNodeKind) => {
    const labels: Record<FlowNodeKind, string> = {
      input: 'Input Node',
      ai: 'AI Node',
      output: 'Output Node'
    }

    const typeMap: Record<FlowNodeKind, string> = {
      input: 'inputNode',
      ai: 'aiNode',
      output: 'outputNode'
    }

    const id = String(nextId.current)
    nextId.current += 1

    const positionIndex = nodes.length

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id,
        type: typeMap[kind],
        data: {
          label: labels[kind],
          kind,
          inputText: kind === 'input' ? '' : undefined,
          promptText: kind === 'ai' ? '' : undefined,
          outputText: kind === 'output' ? '' : undefined,
        },
        position: {
          x: 60 + positionIndex * 24,
          y: 80 + positionIndex * 24
        }
      }
    ])
  }, [nodes.length, setNodes])

  const handleRunWorkflow = useCallback(async () => {
    const aiNodes = nodes.filter(n => n.type === 'aiNode')

    if (aiNodes.length === 0) {
      setToast({ message: 'No AI Node found on the canvas.', type: 'error' })
      return
    }

    let runsPerformed = 0
    setIsRunning(true)
    setExecutionState('running')

    try {
      for (const aiNode of aiNodes) {
        const incomingEdges = edges.filter(e => e.target === aiNode.id)
        const connectedInputNodes = nodes.filter(
          n => n.type === 'inputNode' && incomingEdges.some(e => e.source === n.id)
        )

        const outgoingEdges = edges.filter(e => e.source === aiNode.id)
        const connectedOutputNodes = nodes.filter(
          n => n.type === 'outputNode' && outgoingEdges.some(e => e.target === n.id)
        )

        if (connectedInputNodes.length > 0 && connectedOutputNodes.length > 0) {
          // Set all connected Output Nodes to Running state
          setNodes((nds) =>
            nds.map((n) => {
              if (connectedOutputNodes.some(outNode => outNode.id === n.id)) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    outputText: 'Running...'
                  }
                }
              }
              return n
            })
          )

          const combinedInputText = connectedInputNodes
            .map(n => n.data.inputText ?? '')
            .join('\n')
          const promptText = aiNode.data.promptText ?? ''

          // Call the live Gemini API (gemini-2.5-flash)
          const responseText = await generateAIResponse(combinedInputText, promptText)
          const isErrorResponse = responseText.startsWith('Error:') || responseText.startsWith('Fallback:')

          // Write Gemini response into all connected Output Nodes
          setNodes((nds) =>
            nds.map((n) => {
              if (connectedOutputNodes.some(outNode => outNode.id === n.id)) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    outputText: responseText
                  }
                }
              }
              return n
            })
          )

          if (isErrorResponse) {
            setExecutionState('error')
          } else {
            setExecutionState('completed')
          }
          runsPerformed++
        }
      }

      if (runsPerformed === 0) {
        setToast({ message: 'Workflow configuration error: Connect Input Node -> AI Node -> Output Node.', type: 'error' })
        setExecutionState('idle')
      }
    } catch (err) {
      console.error('[workflow] Execution failed:', err)
      setExecutionState('error')
    } finally {
      setIsRunning(false)
    }
  }, [nodes, edges, setNodes])

  // Execute the actual database write in the background
  const executeDbSave = useCallback(async (data: { id?: string; name: string; nodes: RFNode<SimpleNodeData>[]; edges: RFEdge[] }) => {
    isSavingRef.current = true
    const startTime = performance.now()
    const isNew = !data.id

    try {
      // Build dynamic payload with changed data only (Requirement 4)
      const payload: SaveWorkflowInput = { id: data.id }

      if (!lastSavedWorkflowRef.current) {
        payload.name = data.name
        payload.nodes = data.nodes
        payload.edges = data.edges
      } else {
        const lastSaved = lastSavedWorkflowRef.current

        if (data.name !== lastSaved.name) {
          payload.name = data.name
        }

        const currentNodesClean = data.nodes.map(cleanNode)
        const lastSavedNodesClean = lastSaved.nodes.map(cleanNode)
        if (JSON.stringify(currentNodesClean) !== JSON.stringify(lastSavedNodesClean)) {
          payload.nodes = data.nodes
        }

        const currentEdgesClean = data.edges.map(cleanEdge)
        const lastSavedEdgesClean = lastSaved.edges.map(cleanEdge)
        if (JSON.stringify(currentEdgesClean) !== JSON.stringify(lastSavedEdgesClean)) {
          payload.edges = data.edges
        }

        // If nothing actually changed database-wise, return
        if (payload.name === undefined && payload.nodes === undefined && payload.edges === undefined) {
          isSavingRef.current = false
          // Check if there is a pending save request
          if (pendingSaveRef.current) {
            const nextData = pendingSaveRef.current
            pendingSaveRef.current = null
            executeDbSaveRef.current?.(nextData)
          }
          return
        }
      }

      const saved = await saveWorkflow(payload)

      const duration = performance.now() - startTime
      console.log(`Workflow save took ${duration.toFixed(2)} ms`)

      if (isNew) {
        // Shift local cache to the correct database-allocated ID
        try {
          localStorage.removeItem('flowforge_wf_new')
          localStorage.setItem(`flowforge_wf_${saved.id}`, JSON.stringify({
            id: saved.id,
            name: saved.name,
            nodes: saved.nodes,
            edges: saved.edges,
            updated_at: saved.updated_at
          }))
        } catch (err) {
          console.error('Error shifting local cache:', err)
        }

        setActiveWorkflowId(saved.id)
        setWorkflowName(saved.name)
      }

      // Update our change-tracking reference
      lastSavedWorkflowRef.current = {
        name: saved.name,
        nodes: (saved.nodes as RFNode<SimpleNodeData>[]) || [],
        edges: (saved.edges as RFEdge[]) || []
      }

      fetchWorkflows()
    } catch (err) {
      console.error('Failed to sync workflow with database:', err)
      setSaveStatus('error')
      const msg = err instanceof Error ? err.message : String(err)
      setToast({ message: `Failed to save workflow: ${msg}`, type: 'error' })
    } finally {
      isSavingRef.current = false
      // If a save was queued, run it
      if (pendingSaveRef.current) {
        const nextData = pendingSaveRef.current
        pendingSaveRef.current = null
        executeDbSaveRef.current?.(nextData)
      }
    }
  }, [fetchWorkflows])

  useEffect(() => {
    executeDbSaveRef.current = executeDbSave
  }, [executeDbSave])

  // Enqueue DB save request
  const enqueueDbSave = useCallback((data: { id?: string; name: string; nodes: RFNode<SimpleNodeData>[]; edges: RFEdge[] }) => {
    if (isSavingRef.current) {
      pendingSaveRef.current = data
      return
    }
    executeDbSave(data)
  }, [executeDbSave])

  // Trigger optimistic save (local cache and visual update first)
  const triggerOptimisticSave = useCallback(() => {
    if (!user) return
    if (!workflowName.trim()) return

    const dataToSave = {
      id: activeWorkflowId || undefined,
      name: workflowName.trim(),
      nodes,
      edges
    }

    // 1. Immediately update local cache
    const cacheKey = activeWorkflowId ? `flowforge_wf_${activeWorkflowId}` : 'flowforge_wf_new'
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        id: activeWorkflowId,
        name: workflowName.trim(),
        nodes,
        edges,
        updated_at: new Date().toISOString()
      }))
    } catch (err) {
      console.error('Error writing to local cache:', err)
    }

    // 2. Set saveStatus to saving, and quickly transition to saved (optimistic feedback)
    setSaveStatus('saving')
    const optimisticTimer = setTimeout(() => {
      setSaveStatus('saved')
    }, 150)

    // 3. Queue the background database write
    enqueueDbSave(dataToSave)

    return () => clearTimeout(optimisticTimer)
  }, [user, activeWorkflowId, workflowName, nodes, edges, enqueueDbSave])

  // Save current workflow (manual trigger)
  const handleSaveWorkflow = useCallback(() => {
    if (!user) {
      setToast({ message: 'You must sign in with Google to save workflows.', type: 'error' })
      return
    }

    if (!workflowName.trim()) {
      setToast({ message: 'Workflow name cannot be empty.', type: 'error' })
      return
    }

    triggerOptimisticSave()
    setToast({ message: 'Workflow saved successfully!', type: 'success' })
  }, [user, workflowName, triggerOptimisticSave])

  // Load a workflow (check local cache first, then Supabase)
  const handleLoadWorkflow = useCallback(async (id: string) => {
    // 1. Check local cache first for instant load
    const cached = localStorage.getItem(`flowforge_wf_${id}`)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setNodes(parsed.nodes)
        setEdges(parsed.edges)
        setActiveWorkflowId(parsed.id)
        setWorkflowName(parsed.name)
        setSaveStatus('saved')

        const ids = (parsed.nodes as RFNode<SimpleNodeData>[]).map((n) => parseInt(n.id) || 0)
        const maxId = ids.length > 0 ? Math.max(...ids) : 0
        nextId.current = maxId + 1
      } catch (err) {
        console.error('Error parsing cached workflow:', err)
      }
    }

    // 2. Fetch from Supabase in the background
    try {
      const record = await loadWorkflow(id)
      const loadedNodes = (record.nodes as RFNode<SimpleNodeData>[]) || []
      const loadedEdges = (record.edges as RFEdge[]) || []

      // If cached is empty or database has different values, update state
      const dbClean = { name: record.name, nodes: loadedNodes, edges: loadedEdges }
      const cachedParsed = cached ? JSON.parse(cached) : null

      if (!cachedParsed ||
        cachedParsed.name !== dbClean.name ||
        JSON.stringify(cachedParsed.nodes.map(cleanNode)) !== JSON.stringify(dbClean.nodes.map(cleanNode)) ||
        JSON.stringify(cachedParsed.edges.map(cleanEdge)) !== JSON.stringify(dbClean.edges.map(cleanEdge))
      ) {
        setNodes(loadedNodes)
        setEdges(loadedEdges)
        setActiveWorkflowId(record.id)
        setWorkflowName(record.name)

        const ids = loadedNodes.map((n) => parseInt(n.id) || 0)
        const maxId = ids.length > 0 ? Math.max(...ids) : 0
        nextId.current = maxId + 1

        // Update local cache
        localStorage.setItem(`flowforge_wf_${record.id}`, JSON.stringify({
          id: record.id,
          name: record.name,
          nodes: loadedNodes,
          edges: loadedEdges,
          updated_at: record.updated_at
        }))
      }

      lastSavedWorkflowRef.current = {
        name: record.name,
        nodes: loadedNodes,
        edges: loadedEdges
      }
      setSaveStatus('saved')
      setToast({ message: `Loaded workflow "${record.name}"`, type: 'success' })

      setTimeout(() => {
        flowInstanceRef.current?.fitView()
      }, 100)
    } catch (err) {
      console.error('Error loading workflow:', err)
      // Only show error toast if we didn't successfully load from cache
      if (!cached) {
        const msg = err instanceof Error ? err.message : String(err)
        setToast({ message: `Failed to load workflow: ${msg}`, type: 'error' })
      }
    }
  }, [setNodes, setEdges])

  // Delete a workflow
  const handleDeleteWorkflow = useCallback(async (id: string) => {
    const wf = workflows.find(w => w.id === id)
    const name = wf ? wf.name : 'this workflow'
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      await deleteWorkflow(id)

      // Clean up local cache
      localStorage.removeItem(`flowforge_wf_${id}`)

      setToast({ message: 'Workflow deleted successfully', type: 'success' })
      if (activeWorkflowId === id) {
        setActiveWorkflowId(null)
        setWorkflowName('Untitled Workflow')
        setSaveStatus('idle')
        lastSavedWorkflowRef.current = null
      }
      fetchWorkflows()
    } catch (err: unknown) {
      console.error('Error deleting workflow:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setToast({ message: `Failed to delete workflow: ${msg}`, type: 'error' })
    }
  }, [activeWorkflowId, workflows, fetchWorkflows])

  // Create a new workflow (resets canvas and name)
  const handleNewWorkflow = useCallback(() => {
    setActiveWorkflowId(null)
    setWorkflowName('Untitled Workflow')
    setNodes(initialNodes.map(n => ({ ...n, data: { ...n.data } })))
    setEdges(initialEdges.map(e => ({ ...e })))
    setSaveStatus('idle')
    lastSavedWorkflowRef.current = null
    setToast({ message: 'Created a new local workflow', type: 'success' })
  }, [setNodes, setEdges])

  // Debounced Auto-Save effect
  useEffect(() => {
    if (!user) return

    // Clean current state
    const currentNodesClean = nodes.map(cleanNode)
    const currentEdgesClean = edges.map(cleanEdge)
    const currentWf = { name: workflowName.trim(), nodes: currentNodesClean, edges: currentEdgesClean }

    // Compare with lastSavedWorkflowRef.current
    if (lastSavedWorkflowRef.current) {
      const savedNodesClean = lastSavedWorkflowRef.current.nodes.map(cleanNode)
      const savedEdgesClean = lastSavedWorkflowRef.current.edges.map(cleanEdge)
      const savedWf = { name: lastSavedWorkflowRef.current.name, nodes: savedNodesClean, edges: savedEdgesClean }

      if (JSON.stringify(currentWf) === JSON.stringify(savedWf)) {
        // No actual change, return early
        return
      }
    } else {
      // Untouched template state: do not save a blank Untitled Workflow immediately
      const initialNodesClean = initialNodes.map(cleanNode)
      const initialEdgesClean = initialEdges.map(cleanEdge)
      if (
        !activeWorkflowId &&
        workflowName.trim() === 'Untitled Workflow' &&
        JSON.stringify(currentNodesClean) === JSON.stringify(initialNodesClean) &&
        JSON.stringify(currentEdgesClean) === JSON.stringify(initialEdgesClean)
      ) {
        return
      }
    }

    // Edits exist, schedule save in 1000ms of inactivity
    const delayDebounce = setTimeout(() => {
      triggerOptimisticSave()
    }, 1000)

    return () => clearTimeout(delayDebounce)
  }, [nodes, edges, workflowName, user, activeWorkflowId, triggerOptimisticSave])

  if (currentPath === '/platform') {
    return (
      <PlatformWorkspace
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        theme={theme}
        onNavigate={navigateTo}
      />
    )
  }

  if (currentPath === '/knowledge-hub') {
    return (
      <div className="iframe-container-root">
        <div className="iframe-top-bar">
          <button type="button" onClick={() => navigateTo('/platform')} className="back-btn">
            ← Back to Workspace
          </button>
          <span className="iframe-title">📚 Knowledge Hub | Gnosis</span>
          <div style={{ width: '135px' }} />
        </div>
        <iframe src="https://gnosisapp-theta.vercel.app" className="workspace-iframe" title="Knowledge Hub" />
      </div>
    )
  }

  if (currentPath === '/workflow-studio') {
    return (
      <div className="app-root">
        <TopBar
          executionState={executionState}
          isRunning={isRunning}
          onRunWorkflow={handleRunWorkflow}
          onSaveWorkflow={handleSaveWorkflow}
          workflowName={workflowName}
          onWorkflowNameChange={setWorkflowName}
          saveStatus={saveStatus}
          onLogoClick={() => navigateTo('/platform')}
          theme={theme}
          onThemeChange={setTheme}
        />

        <div className="main-shell">
          <Sidebar
            onAddNode={handleAddNode}
            isRunning={isRunning}
            workflows={workflows}
            onLoadWorkflow={handleLoadWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            activeWorkflowId={activeWorkflowId}
            onNewWorkflow={handleNewWorkflow}
          />

          <main className="canvas-area" style={{ position: 'relative' }}>
            {nodes.length === 0 && (
              <div className="canvas-empty-state">
                <div className="canvas-empty-card">
                  <div className="empty-card-icon">⚡</div>
                  <div className="empty-card-title">Empty Canvas</div>
                  <div className="empty-card-text">
                    Start building your pipeline by adding nodes from the left palette.
                  </div>
                  <div className="empty-card-tips">
                    Tip: Connect <strong>Input Node</strong> → <strong>AI Node</strong> → <strong>Output Node</strong> to generate outputs.
                  </div>
                </div>
              </div>
            )}
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
            />
            <div className="canvas-controls-overlay">
              <button type="button" className="btn nav-tool" onClick={handleZoomOut} aria-label="Zoom out">-</button>
              <button type="button" className="btn nav-tool" onClick={handleFitView} aria-label="Fit view">Fit</button>
              <button type="button" className="btn nav-tool" onClick={handleZoomIn} aria-label="Zoom in">+</button>
            </div>
          </main>
        </div>

        {toast && (
          <div className={`toast-notification ${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✓' : '✗'}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}
      </div>
    )
  }

  // Fallback to landing page
  return (
    <LandingPage
      onLaunchApp={() => navigateTo('/platform')}
      theme={theme}
      onThemeChange={setTheme}
    />
  )
}

export default App
