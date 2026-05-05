export const TYPE_LABELS = {
  process_stage: 'Process Stage',
  machine_element: 'Machine Element',
  machine_part: 'Machine Part',
  procedure: 'Procedure',
  concept: 'Concept',
} as const

export type NodeType = keyof typeof TYPE_LABELS

export const TYPE_COLORS: Record<NodeType, string> = {
  process_stage: '#4f8ef7',
  machine_element: '#27ae60',
  machine_part: '#16a085',
  procedure: '#e67e22',
  concept: '#8e44ad',
}

export const DEFAULT_COLOR = '#95a5a6'
