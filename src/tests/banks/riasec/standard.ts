import { ChoiceQuestion } from '../../types'
import { riasecShort } from './short'

export const riasecStandard: ChoiceQuestion[] = [
  ...riasecShort,
  {
    id: 9,
    kind: 'choice',
    prompt: 'Which is more satisfying?',
    options: [
      { id: 'a', text: 'Test, debug, and improve a practical system', scores: { R: 1, I: 1 } },
      { id: 'b', text: 'Create a reliable checklist or process', scores: { C: 1 } },
    ],
  },
  {
    id: 10,
    kind: 'choice',
    prompt: 'In your role, you prefer to:',
    options: [
      { id: 'a', text: 'Drive alignment and negotiate tradeoffs', scores: { E: 1 } },
      { id: 'b', text: 'Coach, support, and strengthen the team', scores: { S: 1 } },
    ],
  },
  {
    id: 11,
    kind: 'choice',
    prompt: 'Which sounds more like you?',
    options: [
      { id: 'a', text: 'I enjoy analysis and structured thinking', scores: { C: 1, I: 1 } },
      { id: 'b', text: 'I enjoy creative expression and aesthetics', scores: { A: 1 } },
    ],
  },
  {
    id: 12,
    kind: 'choice',
    prompt: 'Pick a preferred work style:',
    options: [
      { id: 'a', text: 'Stable routines and quality control', scores: { C: 1 } },
      { id: 'b', text: 'People-facing work with coordination', scores: { S: 1, E: 1 } },
    ],
  },
]
