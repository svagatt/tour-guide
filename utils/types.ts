export interface Candidate {
  name: string
  address: string
  category?: string
  why_interesting: string
  sources: string[]
}

export interface ResearchResult {
  city: string
  candidates: Candidate[]
}

export interface Stop extends Coordinates {
  order: number
  name: string
  address: string
  category?: string
  description: string
}

export interface Tour {
  city: string
  title: string
  description: string
  stops: Stop[]
}

export interface Coordinates {
  lat?: number
  lng?: number
}