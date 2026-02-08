import { ChoiceQuestion } from '../../types'

export const riasecShort: ChoiceQuestion[] = [
  {
    id: 1,
    kind: 'choice',
    prompt: 'Which task sounds more appealing?',
    options: [
      { id: 'a', text: 'Fix or build something with your hands', scores: { R: 1 } },
      { id: 'b', text: 'Organize data, files, or a process', scores: { C: 1 } },
    ],
  },
  {
    id: 2,
    kind: 'choice',
    prompt: 'Which activity would you prefer?',
    options: [
      { id: 'a', text: 'Create a design, story, or artwork', scores: { A: 1 } },
      { id: 'b', text: 'Investigate a problem and learn how it works', scores: { I: 1 } },
    ],
  },
  {
    id: 3,
    kind: 'choice',
    prompt: 'In a group, you would rather:',
    options: [
      { id: 'a', text: 'Lead and persuade others toward a goal', scores: { E: 1 } },
      { id: 'b', text: 'Support and help people one-on-one', scores: { S: 1 } },
    ],
  },
  {
    id: 4,
    kind: 'choice',
    prompt: 'Which option fits you better?',
    options: [
      { id: 'a', text: 'Analyze and document, then improve the system', scores: { C: 1, I: 1 } },
      { id: 'b', text: 'Pitch an idea and get buy-in from stakeholders', scores: { E: 1 } },
    ],
  },
  {
    id: 5,
    kind: 'choice',
    prompt: 'Which project sounds more interesting?',
    options: [
      { id: 'a', text: 'Operate tools or equipment to produce results', scores: { R: 1 } },
      { id: 'b', text: 'Write, design, or present something creative', scores: { A: 1 } },
    ],
  },
  {
    id: 6,
    kind: 'choice',
    prompt: 'You feel more satisfied when you:',
    options: [
      { id: 'a', text: 'Discover a pattern and explain it clearly', scores: { I: 1 } },
      { id: 'b', text: 'Help someone solve a personal or team problem', scores: { S: 1 } },
    ],
  },
  {
    id: 7,
    kind: 'choice',
    prompt: 'Which style do you prefer?',
    options: [
      { id: 'a', text: 'Structured routines and clear rules', scores: { C: 1 } },
      { id: 'b', text: 'Competition, influence, and negotiation', scores: { E: 1 } },
    ],
  },
  {
    id: 8,
    kind: 'choice',
    prompt: 'Pick the option you would enjoy more:',
    options: [
      { id: 'a', text: 'Read and research, then present findings', scores: { I: 1 } },
      { id: 'b', text: 'Build a prototype and iterate on it', scores: { R: 1, A: 1 } },
    ],
  },
]
