import Web3 from 'web3'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@uniswap/sdk-core'

import { ERC20Contract } from '../contracts/ERC20Contract'
import { getProvider } from '../constants/provider'
import { getChainId } from './web3'
import { getToken } from '../methods/tokenLists'

/**
 * Token or native currency balance for given network.
 * @param {Web3} web3 Web3 instance.
 * @param {Token | string} token Token instance or token's symbol representation in given network.
 * @param {string} account Account address.
 * @returns {Promise<CurrencyAmount>}
 */
export async function tokenBalance(
    web3: Web3,
    token: Token | string,
    account: string
): Promise<CurrencyAmount<NativeCurrency | Currency>> {
    let _token
    if (token instanceof Token) {
        _token = token
    } else {
        const chainId = await getChainId(web3)
        _token = (await getToken(chainId, token === 'ETH' ? 'WETH' : token)) as Token
    }

    if (_token.symbol === 'ETH') {
        return CurrencyAmount.fromRawAmount(
            _token,
            await web3.eth
                .getBalance(account)
                .catch(_ => 0)
                .then(v => v.toString())
        )
    }

    return CurrencyAmount.fromRawAmount(
        _token,
        await ERC20Contract(web3, _token.address)
            .methods.balanceOf(account)
            .call()
    )
}
