import { ChoiceQuestion } from '../../types'
import { riasecStandard } from './standard'

export const riasecLong: ChoiceQuestion[] = [
  ...riasecStandard,
  {
    id: 13,
    kind: 'choice',
    prompt: 'You would rather spend a day doing:',
    options: [
      { id: 'a', text: 'Deep research and problem analysis', scores: { I: 1 } },
      { id: 'b', text: 'Presenting and persuading to move a decision', scores: { E: 1 } },
    ],
  },
  {
    id: 14,
    kind: 'choice',
    prompt: 'In a project, you prefer to own:',
    options: [
      { id: 'a', text: 'Process, documentation, and quality', scores: { C: 1 } },
      { id: 'b', text: 'Helping others succeed and team health', scores: { S: 1 } },
    ],
  },
  {
    id: 15,
    kind: 'choice',
    prompt: 'Which feels more like your strength?',
    options: [
      { id: 'a', text: 'Operate and optimize within constraints', scores: { C: 1, R: 1 } },
      { id: 'b', text: 'Create and communicate something original', scores: { A: 1 } },
    ],
  },
  {
    id: 16,
    kind: 'choice',
    prompt: 'Pick the option you prefer:',
    options: [
      { id: 'a', text: 'Hands-on work with tangible outputs', scores: { R: 1 } },
      { id: 'b', text: 'Work centered on people and relationships', scores: { S: 1 } },
    ],
  },
]
