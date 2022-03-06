import { isNumber } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'

import { useWallet } from '../../lib/wallet/GoodWalletProvider'

const log = logger.child({ from: 'useGoodDollarPrice' })

const useGoodDollarPrice = () => {
  const goodWallet = useWallet()
  const [price, setPrice] = useState(null)
  const showPrice = useMemo(() => isNumber(price), [price])

  useEffect(() => {
    const fetchGoodDollarPrice = async () => {
      try {
        const price = await goodWallet.getReservePriceDAI()

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
  }, [setPrice, goodWallet])

  return [price, showPrice]
}

export default useGoodDollarPrice
