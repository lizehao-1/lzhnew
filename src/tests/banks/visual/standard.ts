import { ImageQuestion } from '../../types'
import { visualShort } from './short'

export const visualStandard: ImageQuestion[] = [
  ...visualShort,
  {
    id: 3,
    kind: 'image',
    prompt: 'Pick the image that feels most "you" today.',
    options: [
      { id: 'a', src: '/images/tests/mbti.jpg', scores: { structure: 1 } },
      { id: 'b', src: '/images/tests/sjt.jpg', scores: { pragmatism: 1 } },
      { id: 'c', src: '/images/tests/big5.jpg', scores: { calm: 1 } },
      { id: 'd', src: '/images/tests/visual.jpg', scores: { curiosity: 1 } },
    ],
  },
  {
    id: 4,
    kind: 'image',
    prompt: 'Pick the image that feels most motivating.',
    options: [
      { id: 'a', src: '/images/tests/sjt.jpg', scores: { drive: 1 } },
      { id: 'b', src: '/images/tests/riasec.jpg', scores: { explore: 1 } },
      { id: 'c', src: '/images/tests/visual.jpg', scores: { curiosity: 1 } },
      { id: 'd', src: '/images/tests/mbti.jpg', scores: { focus: 1 } },
    ],
  },
]
