import { useEffect } from 'react'

import Config from '../../config/config'
import { fireEvent } from '../analytics/analytics'

const createABTesting = (percentage = Config.abTestPercentage) => {
  const isCaseA = Math.random() < percentage
  const ab = isCaseA ? 'A' : 'B'

  const useABTesting = (componentA, componentB, event = null) => {
    const component = isCaseA ? componentA : componentB

    useEffect(() => void (event && fireEvent(event, { ab })), [])

    return [component, ab]
  }

  return { useABTesting }
}

export default createABTesting
