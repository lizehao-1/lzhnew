import { ChoiceQuestion } from '../../types'

export const sjtShort: ChoiceQuestion[] = [
  {
    id: 1,
    kind: 'choice',
    prompt: 'A teammate submits work that is clearly wrong right before the deadline. What do you do?',
    options: [
      { id: 'a', text: 'Call out the key issues, align on a fix plan, then split the work', scores: { collaboration: 2, execution: 2 } },
      { id: 'b', text: 'Fix it yourself to hit the deadline, then give feedback later', scores: { execution: 2, collaboration: 0 } },
      { id: 'c', text: 'Publicly push them to redo it to protect quality', scores: { assertiveness: 2, collaboration: -1 } },
      { id: 'd', text: 'Avoid conflict and wait for them to notice', scores: { risk: -2 } },
    ],
  },
  {
    id: 2,
    kind: 'choice',
    prompt: 'A meeting turns into an argument and starts to drift. What do you do?',
    options: [
      { id: 'a', text: 'Summarize the disagreement and propose a concrete next step', scores: { collaboration: 2, execution: 1 } },
      { id: 'b', text: 'Stay quiet and follow up privately after the meeting', scores: { collaboration: 1, assertiveness: 0 } },
      { id: 'c', text: 'Strongly push your preferred option to force convergence', scores: { assertiveness: 2, risk: -1 } },
      { id: 'd', text: 'Agree with the majority for harmony, adjust later', scores: { risk: -1, collaboration: 1 } },
    ],
  },
  {
    id: 3,
    kind: 'choice',
    prompt: 'You are assigned an unfamiliar task with little context. How do you start?',
    options: [
      { id: 'a', text: 'Clarify goal, scope, and acceptance criteria; list risks and plan', scores: { execution: 2 } },
      { id: 'b', text: 'Build a minimal version first and iterate while asking questions', scores: { execution: 1, risk: 1 } },
      { id: 'c', text: 'Find a knowledgeable person to walk you through the background', scores: { collaboration: 2 } },
      { id: 'd', text: 'Wait for more information to reduce mistakes', scores: { risk: -2 } },
    ],
  },
  {
    id: 4,
    kind: 'choice',
    prompt: 'You notice a small production issue that affects a minority of users. What do you do?',
    options: [
      { id: 'a', text: 'Mitigate first, align stakeholders, then root-cause and plan follow-ups', scores: { execution: 2, collaboration: 2 } },
      { id: 'b', text: 'Fix it quietly first, notify others once confirmed', scores: { execution: 2 } },
      { id: 'c', text: 'Announce the risk and ask people to work around it', scores: { collaboration: 1, risk: 0 } },
      { id: 'd', text: 'Hold off until impact is clearer', scores: { risk: -2 } },
    ],
  },
  {
    id: 5,
    kind: 'choice',
    prompt: 'A collaborator is slow to respond and it blocks progress. How do you handle it?',
    options: [
      { id: 'a', text: 'State the impact and deadline, propose two options, set a check-in time', scores: { assertiveness: 1, execution: 2, collaboration: 1 } },
      { id: 'b', text: 'Send gentle reminders and avoid pressure', scores: { collaboration: 1 } },
      { id: 'c', text: 'Escalate to their manager to speed things up', scores: { assertiveness: 2, collaboration: 0 } },
      { id: 'd', text: 'Change your plan to depend on them less', scores: { execution: 1, collaboration: 0 } },
    ],
  },
  {
    id: 6,
    kind: 'choice',
    prompt: 'In an interview, you are asked a question you do not know. What do you do?',
    options: [
      { id: 'a', text: 'Be honest, explain your reasoning process and how you would validate', scores: { assertiveness: 1, execution: 2, risk: 0 } },
      { id: 'b', text: 'Try to bluff with vague statements', scores: { risk: -2 } },
      { id: 'c', text: 'Say you do not know and stop there', scores: { risk: -1, collaboration: 0 } },
      { id: 'd', text: 'Give a confident conclusion without evidence', scores: { assertiveness: 2, risk: -2 } },
    ],
  },
]
