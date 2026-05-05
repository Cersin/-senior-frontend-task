export const NODE_TYPES = [
  'process_stage',
  'machine_element',
  'machine_part',
  'procedure',
  'concept',
] as const

export type NodeType = (typeof NODE_TYPES)[number]

// Type labels - maps type key to i18n translation key
export const TYPE_LABELS: Record<NodeType, string> = {
  process_stage: 'chunkPanel.types.process_stage',
  machine_element: 'chunkPanel.types.machine_element',
  machine_part: 'chunkPanel.types.machine_part',
  procedure: 'chunkPanel.types.procedure',
  concept: 'chunkPanel.types.concept',
}

export const TYPE_COLORS: Record<NodeType, string> = {
  process_stage: '#4f8ef7',
  machine_element: '#27ae60',
  machine_part: '#16a085',
  procedure: '#e67e22',
  concept: '#8e44ad',
}

export const DEFAULT_COLOR = '#95a5a6'
