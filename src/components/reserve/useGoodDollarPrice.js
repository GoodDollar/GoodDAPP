import { useEffect, useMemo, useState } from 'react'

import logger from '../../lib/logger/js-logger'

import userStorage from '../../lib/userStorage/UserStorage'
import ReserveAPI from './api'

const ONE_DAY = 24 * 60 * 60 * 1000
const log = logger.child({ from: 'useGoodDollarPrice' })

const useGoodDollarPrice = () => {
  const [showPriceChange, setShowPriceChange] = useState(false)
  const [tokenStats, setTokenStats] = useState(null)
  const showPrice = useMemo(() => Boolean(tokenStats), [tokenStats])

  useEffect(() => {
    const fetchGoodDollarPrice = async () => {
      const firstVisitAppDate = userStorage.userProperties.get('firstVisitApp')
      const showChange = firstVisitAppDate && Date.now() - firstVisitAppDate >= ONE_DAY

      try {
        const stats = await ReserveAPI.getGoodDollarPrice(showChange)

        log.debug('Got G$ price:', { showChange, stats })

        setTokenStats(stats)
        setShowPriceChange(showChange)
      } catch (exception) {
        const { message } = exception

        log.error('Error fetching G$ price:', message, exception, { showChange })
      }
    }

    fetchGoodDollarPrice()
  }, [setShowPriceChange, setTokenStats])

  return {
    ...tokenStats,
    showPrice,
    showPriceChange,
  }
}

export default useGoodDollarPrice
