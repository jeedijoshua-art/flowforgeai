export type FlowNodeKind = 'input' | 'ai' | 'output';

export interface SimpleNodeData {
  label: string;
  kind: FlowNodeKind;
  inputText?: string;
  promptText?: string;
  outputText?: string;
}
