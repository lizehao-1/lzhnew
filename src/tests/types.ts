export type QuizLength = 'short' | 'standard' | 'long'

export type LikertOptionValue = 1 | 2 | 3 | 4 | 5

export type LikertQuestion = {
  id: number
  kind: 'likert'
  prompt: string
  example?: string
  trait: 'O' | 'C' | 'E' | 'A' | 'N'
  reverse?: boolean
}

export type ChoiceQuestion = {
  id: number
  kind: 'choice'
  prompt: string
  example?: string
  options: Array<{
    id: string
    text: string
    scores: Record<string, number>
  }>
}

export type ImageQuestion = {
  id: number
  kind: 'image'
  prompt: string
  example?: string
  options: Array<{
    id: string
    src: string
    alt?: string
    label?: string
    scores: Record<string, number>
  }>
}

export type QuizQuestion = LikertQuestion | ChoiceQuestion | ImageQuestion

export type QuizAnswers = Record<number, unknown>
