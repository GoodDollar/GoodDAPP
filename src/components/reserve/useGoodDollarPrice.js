import { isNumber } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'

import GoodWallet from '../../lib/wallet/GoodWallet'

const log = logger.child({ from: 'useGoodDollarPrice' })

const useGoodDollarPrice = () => {
  const [price, setPrice] = useState(null)
  const showPrice = useMemo(() => isNumber(price), [price])

  useEffect(() => {
    const fetchGoodDollarPrice = async () => {
      try {
        const price = await GoodWallet.getReservePriceDAI()

        log.debug('Got G$ price:', { price })

        setPrice(price)
      } catch (exception) {
        const { message } = exception

        log.error('Error fetching G$ price:', message, exception)
      }
    }

    if (Config.showGoodDollarPrice) {
      fetchGoodDollarPrice()
    }
  }, [setPrice])

  return [price, showPrice]
}

export default useGoodDollarPrice
