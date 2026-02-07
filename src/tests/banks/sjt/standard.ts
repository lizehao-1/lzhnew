import { ChoiceQuestion } from '../../types'
import { sjtShort } from './short'

export const sjtStandard: ChoiceQuestion[] = [
  ...sjtShort,
  {
    id: 7,
    kind: 'choice',
    prompt: 'You realize your solution has a major flaw that may harm trust. What do you do?',
    options: [
      { id: 'a', text: 'Own it early, explain impact and a mitigation plan, and communicate risks', scores: { collaboration: 2, assertiveness: 1, execution: 1 } },
      { id: 'b', text: 'Fix it first and only mention it if asked', scores: { execution: 2, collaboration: 0 } },
      { id: 'c', text: 'Emphasize external constraints to reduce blame', scores: { risk: -1, assertiveness: 1 } },
      { id: 'd', text: 'Avoid details so the issue does not expand', scores: { risk: -2 } },
    ],
  },
  {
    id: 8,
    kind: 'choice',
    prompt: 'Priorities change suddenly and a more urgent task arrives. What do you do?',
    options: [
      { id: 'a', text: 'Re-align priorities with stakeholders and adjust plan explicitly', scores: { execution: 2, collaboration: 2 } },
      { id: 'b', text: 'Try to do both by working longer hours', scores: { execution: 1, risk: 0 } },
      { id: 'c', text: 'Finish the original task first to avoid context switching', scores: { execution: 1, risk: -1 } },
      { id: 'd', text: 'Pause until you get written direction from leadership', scores: { risk: -1, collaboration: 0 } },
    ],
  },
  {
    id: 9,
    kind: 'choice',
    prompt: 'Someone consistently underperforms, but the team avoids addressing it. What do you do?',
    options: [
      { id: 'a', text: 'Talk privately, understand why, and agree on measurable improvement goals', scores: { collaboration: 2, assertiveness: 1 } },
      { id: 'b', text: 'State standards publicly in general terms to nudge behavior', scores: { assertiveness: 1, risk: 0 } },
      { id: 'c', text: 'Call it out directly in a meeting to force change', scores: { assertiveness: 2, collaboration: -1 } },
      { id: 'd', text: 'Stay out of it; it is not your responsibility', scores: { risk: -1 } },
    ],
  },
  {
    id: 10,
    kind: 'choice',
    prompt: 'You notice the other person is emotionally escalated and it may affect decisions. What do you do?',
    options: [
      { id: 'a', text: 'Lower the tension, confirm concerns, then return to facts and options', scores: { collaboration: 2 } },
      { id: 'b', text: 'Keep pushing logic and facts; emotions should not matter', scores: { assertiveness: 1, risk: -1 } },
      { id: 'c', text: 'Pause the meeting and handle it 1:1 to avoid escalation', scores: { collaboration: 1, execution: 1 } },
      { id: 'd', text: 'Call them out for being emotional and demand rationality', scores: { assertiveness: 2, collaboration: -2 } },
    ],
  },
  {
    id: 11,
    kind: 'choice',
    prompt: 'You must decide with incomplete information. What do you do?',
    options: [
      { id: 'a', text: 'List assumptions and run a small validation before committing', scores: { execution: 2, risk: 1 } },
      { id: 'b', text: 'Decide quickly based on experience and push forward', scores: { assertiveness: 1, execution: 1 } },
      { id: 'c', text: 'Wait until information is complete to avoid mistakes', scores: { risk: -1 } },
      { id: 'd', text: 'Let others commit first and follow the majority', scores: { risk: -1 } },
    ],
  },
  {
    id: 12,
    kind: 'choice',
    prompt: 'A junior repeats the same mistakes. How do you coach them?',
    options: [
      { id: 'a', text: 'Create a checklist, set review points, and iterate systematically', scores: { collaboration: 2, execution: 2 } },
      { id: 'b', text: 'Let them learn by doing with minimal intervention', scores: { execution: 1 } },
      { id: 'c', text: 'Take back the critical part to guarantee quality', scores: { execution: 2, collaboration: 0 } },
      { id: 'd', text: 'Criticize them for carelessness and demand self-correction', scores: { assertiveness: 2, collaboration: -1 } },
    ],
  },
]
