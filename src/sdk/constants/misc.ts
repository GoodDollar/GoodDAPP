import { Percent } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

/* Used to ensure the user doesn't send so much ETH so they end up with <.01 */
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')
