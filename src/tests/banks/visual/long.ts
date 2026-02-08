import { ImageQuestion } from '../../types'
import { visualStandard } from './standard'

export const visualLong: ImageQuestion[] = [
  ...visualStandard,
  {
    id: 5,
    kind: 'image',
    prompt: 'Pick the image that best matches your work style.',
    options: [
      { id: 'a', src: '/images/tests/big5.jpg', scores: { calm: 1 } },
      { id: 'b', src: '/images/tests/sjt.jpg', scores: { drive: 1 } },
      { id: 'c', src: '/images/tests/riasec.jpg', scores: { explore: 1 } },
      { id: 'd', src: '/images/tests/visual.jpg', scores: { curiosity: 1 } },
    ],
  },
]
