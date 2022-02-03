// @flow

import { get, map } from 'lodash'
import API from '../../lib/API/api'
import GoodWallet from '../../lib/wallet/GoodWallet'

type GoodDollarStats = {
  price: number,
  priceChange?: number,
  priceChangePercentage?: number,
  priceIncreasing?: boolean,
  priceDecreasing?: boolean,
}

class ReserveAPI {
  http = null

  wallet = null

  constructor(httpClient, wallet) {
    this.http = httpClient
    this.wallet = wallet
  }

  async getGoodDollarPrice(withStats: boolean = true): Promise<GoodDollarStats> {
    const { http, wallet } = this
    const price = await wallet.getReservePriceDAI()
    const tokenStats: GoodDollarStats = { price }

    if (false !== withStats) {
      const [currentPrice, previousPrice] = await http
        .getGoodDollarReservePrice()
        .then(gqlResponse => get(gqlResponse, 'data.reserveHistories', []))
        .then(priceHistory => map(priceHistory, 'openPriceDAI'))

      if (currentPrice > 0 && previousPrice > 0) {
        tokenStats.priceChange = currentPrice - previousPrice
        tokenStats.priceChangePercentage = (100 * tokenStats.priceChange) / previousPrice
        tokenStats.priceIncreasing = tokenStats.priceChange > 0
        tokenStats.priceDecreasing = tokenStats.priceChange < 0
      }
    }

    return tokenStats
  }
}

export default new ReserveAPI(API, GoodWallet)
