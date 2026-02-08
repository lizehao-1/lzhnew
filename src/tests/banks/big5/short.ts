import { LikertQuestion } from '../../types'

export const big5Short: LikertQuestion[] = [
  { id: 1, kind: 'likert', trait: 'C', prompt: 'I keep my commitments and deadlines.' },
  { id: 2, kind: 'likert', trait: 'E', prompt: 'I feel energized by social interaction.' },
  { id: 3, kind: 'likert', trait: 'N', prompt: 'I get stressed easily when things are uncertain.' },
  { id: 4, kind: 'likert', trait: 'A', prompt: 'I try to be considerate and cooperative.' },
  { id: 5, kind: 'likert', trait: 'O', prompt: 'I enjoy exploring new ideas and perspectives.' },
  { id: 6, kind: 'likert', trait: 'C', prompt: 'I often procrastinate on important tasks.', reverse: true },
  { id: 7, kind: 'likert', trait: 'E', prompt: 'In groups, I usually stay quiet and let others lead.', reverse: true },
  { id: 8, kind: 'likert', trait: 'N', prompt: 'I stay calm under pressure.', reverse: true },
  { id: 9, kind: 'likert', trait: 'A', prompt: 'I can be blunt even if it hurts feelings.', reverse: true },
  { id: 10, kind: 'likert', trait: 'O', prompt: 'I prefer routines over novelty.', reverse: true },
  { id: 11, kind: 'likert', trait: 'C', prompt: 'I plan ahead and break work into steps.' },
  { id: 12, kind: 'likert', trait: 'E', prompt: 'I enjoy meeting new people.' },
]
