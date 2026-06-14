import { supabase } from '../lib/supabase'

export interface WorkflowRecord {
  id: string
  user_id: string
  name: string
  nodes: unknown
  edges: unknown
  created_at: string
  updated_at: string
}

export type SaveWorkflowInput = {
  id?: string
  name?: string
  nodes?: unknown
  edges?: unknown
}

export const saveWorkflow = async (workflow: SaveWorkflowInput): Promise<WorkflowRecord> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User is not authenticated')

  if (workflow.id) {
    // Update existing workflow
    const updatePayload: Record<string, unknown> = {}
    if (workflow.name !== undefined) updatePayload.name = workflow.name
    if (workflow.nodes !== undefined) updatePayload.nodes = workflow.nodes
    if (workflow.edges !== undefined) updatePayload.edges = workflow.edges

    // If nothing to update, just fetch the existing workflow record
    if (Object.keys(updatePayload).length === 0) {
      return loadWorkflow(workflow.id)
    }

    const { data, error } = await supabase
      .from('workflows')
      .update(updatePayload)
      .eq('id', workflow.id)
      .eq('user_id', user.id) // Ensure updating owned workflow
      .select()
      .single()

    if (error) throw error
    return data as WorkflowRecord
  } else {
    // Create new workflow
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name: workflow.name || 'Untitled Workflow',
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data as WorkflowRecord
  }
}

export const loadWorkflow = async (id: string): Promise<WorkflowRecord> => {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as WorkflowRecord
}

export const listWorkflows = async (): Promise<Pick<WorkflowRecord, 'id' | 'name' | 'created_at' | 'updated_at'>[]> => {
  const { data, error } = await supabase
    .from('workflows')
    .select('id, name, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export const deleteWorkflow = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)

  if (error) throw error
}
