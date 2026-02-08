import { LikertQuestion } from '../../types'
import { big5Short } from './short'

export const big5Standard: LikertQuestion[] = [
  ...big5Short,
  { id: 13, kind: 'likert', trait: 'O', prompt: 'I like to learn about unfamiliar topics.' },
  { id: 14, kind: 'likert', trait: 'A', prompt: 'I try to see the best in other people.' },
  { id: 15, kind: 'likert', trait: 'N', prompt: 'I worry about making mistakes.' },
  { id: 16, kind: 'likert', trait: 'E', prompt: 'I start conversations easily.' },
  { id: 17, kind: 'likert', trait: 'C', prompt: 'I keep things organized.' },
  { id: 18, kind: 'likert', trait: 'O', prompt: 'I dislike abstract discussions.', reverse: true },
  { id: 19, kind: 'likert', trait: 'A', prompt: 'I get irritated by others quickly.', reverse: true },
  { id: 20, kind: 'likert', trait: 'N', prompt: 'I feel emotionally stable.', reverse: true },
  { id: 21, kind: 'likert', trait: 'E', prompt: 'I prefer to be alone most of the time.', reverse: true },
  { id: 22, kind: 'likert', trait: 'C', prompt: 'I have trouble sticking to a plan.', reverse: true },
  { id: 23, kind: 'likert', trait: 'O', prompt: 'I enjoy trying new activities.' },
  { id: 24, kind: 'likert', trait: 'A', prompt: 'I am patient with people who work differently.' },
]
