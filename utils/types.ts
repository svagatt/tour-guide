export interface Candidate {
  name: string
  address: string
  category?: Category
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

export enum Category {
  HISTORICAL = 'Historical',
  FOOD = 'Food',
  ARCHITECTURE = 'Architecture',
  HIDDEN_GEM = 'Hidden Gem',
  VIEWPOINT = 'Viewpoint',
  CULTURAL = 'Cultural',
}