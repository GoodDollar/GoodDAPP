import { Currency } from '@uniswap/sdk-core'

import { getTokens } from './methods/tokenLists'
import { SupportedChainId } from './constants/chains'

/**
 * Return list of tokens based on current chain ID.
 * @param {string | number} chainId Web3 instance.
 * @returns {Currency[]}
 */
export async function getList(chainId: SupportedChainId): Promise<Currency[]> {
    const [tokens] = await getTokens(chainId)

    return Array.from(tokens.values()).filter(
        token => token.name && token.symbol && !['G$', 'GDX', 'GDAO'].includes(token.symbol)
    )
}
