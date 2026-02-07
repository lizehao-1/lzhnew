import { ChoiceQuestion } from '../../types'
import { sjtStandard } from './standard'

export const sjtLong: ChoiceQuestion[] = [
  ...sjtStandard,
  {
    id: 13,
    kind: 'choice',
    prompt: 'You receive feedback that you are too forceful. What do you do?',
    options: [
      { id: 'a', text: 'Thank them, clarify intent, ask for examples, and adjust', scores: { collaboration: 2 } },
      { id: 'b', text: 'Explain you prioritize efficiency and will watch your tone', scores: { assertiveness: 1 } },
      { id: 'c', text: 'Reduce communication to avoid being misunderstood', scores: { risk: -1 } },
      { id: 'd', text: 'Reject the feedback as oversensitivity', scores: { collaboration: -2 } },
    ],
  },
  {
    id: 14,
    kind: 'choice',
    prompt: 'You must report bad news (delay / metric drop) to leadership. How do you do it?',
    options: [
      { id: 'a', text: 'Lead with conclusion and impact, then causes, options, and asks', scores: { execution: 2, assertiveness: 1 } },
      { id: 'b', text: 'Lead with causes to soften the impact', scores: { risk: -1 } },
      { id: 'c', text: 'Report facts only and wait for direction', scores: { risk: -1 } },
      { id: 'd', text: 'Shift blame to external factors and emphasize effort', scores: { collaboration: -1, risk: -1 } },
    ],
  },
  {
    id: 15,
    kind: 'choice',
    prompt: 'In an interview, the interviewer strongly disagrees with you. What do you do?',
    options: [
      { id: 'a', text: 'Confirm their concerns and add data/examples; seek common ground', scores: { collaboration: 2, assertiveness: 1 } },
      { id: 'b', text: 'Argue until they agree', scores: { assertiveness: 2, collaboration: -1 } },
      { id: 'c', text: 'Immediately change your position to match them', scores: { risk: -1 } },
      { id: 'd', text: 'Stop discussing and switch topic', scores: { risk: -1 } },
    ],
  },
]
