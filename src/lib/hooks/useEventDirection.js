import { useEffect, useState } from 'react'

const useEventDirection = (feedItemType, reverse = false) => {
  const [direction, setDirection] = useState('')
  const sendCases = ['senddirect', 'send']
  const receiveCases = ['claim', 'receive', 'withdraw', 'bonus']

  useEffect(() => {
    setDirection(() => {
      if (receiveCases.includes(feedItemType)) {
        return reverse ? 'to: ' : 'from: '
      }

      if (sendCases.includes(feedItemType)) {
        return reverse ? 'from: ' : 'to: '
      }
    })
  }, [feedItemType])

  return direction
}

export default useEventDirection
