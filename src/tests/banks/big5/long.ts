import { LikertQuestion } from '../../types'
import { big5Standard } from './standard'

export const big5Long: LikertQuestion[] = [
  ...big5Standard,
  { id: 25, kind: 'likert', trait: 'C', prompt: 'I pay attention to details.' },
  { id: 26, kind: 'likert', trait: 'E', prompt: 'I am comfortable speaking to a group.' },
  { id: 27, kind: 'likert', trait: 'N', prompt: 'I feel tense or anxious often.' },
  { id: 28, kind: 'likert', trait: 'A', prompt: 'I am willing to compromise to keep harmony.' },
  { id: 29, kind: 'likert', trait: 'O', prompt: 'I enjoy creative or artistic activities.' },
  { id: 30, kind: 'likert', trait: 'C', prompt: 'I make decisions without thinking things through.', reverse: true },
  { id: 31, kind: 'likert', trait: 'E', prompt: 'I avoid being the center of attention.', reverse: true },
  { id: 32, kind: 'likert', trait: 'N', prompt: 'I recover quickly after setbacks.', reverse: true },
  { id: 33, kind: 'likert', trait: 'A', prompt: 'I enjoy arguing and debating with people.', reverse: true },
  { id: 34, kind: 'likert', trait: 'O', prompt: 'I find it hard to appreciate unconventional ideas.', reverse: true },
  { id: 35, kind: 'likert', trait: 'C', prompt: 'I follow through even when work is boring.' },
  { id: 36, kind: 'likert', trait: 'E', prompt: 'I like being around people most of the time.' },
]
