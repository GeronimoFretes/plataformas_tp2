export interface Ingredient {
  id: string
  name: string
  index: number
  quantity?: number | null
}

export interface Prediction {
  label: string
  confidence: number
}

export interface ClassLabels {
  [key: number]: string
}
