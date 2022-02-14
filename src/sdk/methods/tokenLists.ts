import Web3 from 'web3'
import { ethers } from 'ethers'
import { Currency, Ether, Token } from '@uniswap/sdk-core'
import flatMap from 'lodash/flatMap'

import { SupportedChainId } from '../constants/chains'
import { FUSE, G$, GDAO, GDX, TOKEN_LISTS } from '../constants/tokens'
import { UnsupportedChainId } from '../utils/errors'
import { getChainId } from '../utils/web3'
import { ERC20Contract } from '../contracts/ERC20Contract'

import UniswapTokenList from '../tokens/tokens.uniswap.org.json'
import FuseTokenList from '../tokens/fuseswap-default.tokenlist.json'
import { debug } from '../utils/debug'

const cachedTokens: Map<SupportedChainId, Map<string, Currency>> = new Map()
const cachedTokensByAddress: Map<SupportedChainId, Map<string, Currency>> = new Map()

type TokenType = {
    chainId: number
    address: string
    decimals: number
    logoURI: string
    name: string
    symbol: string
    isDeprecated?: boolean
}

/**
 * List of tokens from given url.
 * @see https://tokenlists.org/
 * @param {string} url Url to fetch.
 * @returns {TokenType[]} List of tokens.
 */
async function fetchURL(url: string): Promise<TokenType[]> {
    return fetch(url)
        .then(r => r.json())
        .then(r => r.tokens)
        .catch(e => {
            debug(url, e.message)
            return []
        })
}

/**
 * Cache single token.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {Token} token Necessary token.
 */
export async function cacheToken(supportedChainId: SupportedChainId, token: Token): Promise<void> {
    const [tokenList, tokenListByAddress] = await getTokens(supportedChainId)

    if (!tokenListByAddress || !tokenList) {
        throw new UnsupportedChainId(supportedChainId)
    }

    if (!tokenList.has(token.symbol!) && !tokenListByAddress.has(token.address)) {
        tokenList.set(token.symbol!, token)
        tokenListByAddress.set(token.address, token)
    }
}

/**
 * Trying to fetch token from predefined list or fetch it from ERC20 contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Token address.
 * @returns {Token | Currency}
 */
export async function getTokenByAddress(web3: Web3, address: string): Promise<Token | Currency> {
    const chainId = await getChainId(web3)

    let token = await getTokenByAddressFromList(chainId, address)

    if (!token) {
        const contract = await ERC20Contract(web3, address)
        const symbol = await contract.methods.symbol().call()
        const decimals = parseInt((await contract.methods.decimals().call()).toString())

        token = new Token(chainId, address, isNaN(decimals) ? 0 : decimals, symbol)

        await cacheToken(chainId, token)
    }

    return token
}

/**
 * Retrieves and cache list of tokens for given chain ID.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @returns {Promise<[Map<string, Currency>, Map<string, Currency>]>} Pairs of `symbol <-> Currency`.
 */
export async function getTokens(
    supportedChainId: SupportedChainId
): Promise<[Map<string, Currency>, Map<string, Currency>]> {
    const list = TOKEN_LISTS[supportedChainId] || []

    if (cachedTokens.has(supportedChainId)) {
        return [cachedTokens.get(supportedChainId)!, cachedTokensByAddress.get(supportedChainId)!]
    }

    const tokenList = new Map<string, Currency>()
    const tokenListByAddress = new Map<string, Currency>()

    if (supportedChainId !== SupportedChainId.FUSE) {
        tokenList.set('ETH', Ether.onChain(supportedChainId))
        tokenListByAddress.set(ethers.constants.AddressZero, Ether.onChain(supportedChainId))
    } else {
        tokenList.set('FUSE', FUSE)
        tokenListByAddress.set(ethers.constants.AddressZero, FUSE)
    }

    const tokens = flatMap(
        await Promise.all([UniswapTokenList.tokens, FuseTokenList.tokens, ...list.map(fetchURL)])
    ).filter(Boolean)

    for (const token of tokens) {
        const { chainId, address, decimals, name, symbol, isDeprecated } = token as TokenType
        if (isDeprecated) {
            continue
        }
        if (tokenList.has(symbol) || supportedChainId !== chainId) {
            continue
        }

        const _token = new Token(chainId, address, decimals, symbol, name)
        tokenList.set(symbol, _token)
        tokenListByAddress.set(address, _token)
    }

    // Add G$ support.
    if (G$[supportedChainId]) {
        tokenList.set('G$', G$[supportedChainId])
        tokenListByAddress.set(G$[supportedChainId].address, G$[supportedChainId])
    }

    // Add G$X support.
    if (GDX[supportedChainId]) {
        tokenList.set('GDX', GDX[supportedChainId])
        tokenListByAddress.set(GDX[supportedChainId].address, GDX[supportedChainId])
    }

    // Add GDAO support.
    if (GDAO[supportedChainId]) {
        tokenList.set('GDAO', GDAO[supportedChainId])
        tokenListByAddress.set(GDAO[supportedChainId].address, GDAO[supportedChainId])
    }

    cachedTokens.set(supportedChainId, tokenList)
    cachedTokensByAddress.set(supportedChainId, tokenListByAddress)

    return [tokenList, tokenListByAddress]
}

/**
 * Get single token from cached list of tokens.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {string} symbol Symbol, that represents currency.
 * @returns {Promise<Currency | undefined>} Given currency or undefined, if it not exists.
 */
export async function getToken(supportedChainId: SupportedChainId, symbol: string): Promise<Currency | undefined> {
    return getTokens(supportedChainId).then(([map]) => map.get(symbol))
}

/**
 * Get single token from cached list of tokens.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {string} address Address, that represents currency.
 * @returns {Promise<Currency | undefined>} Given currency or undefined, if it not exists.
 */
export async function getTokenByAddressFromList(
    supportedChainId: SupportedChainId,
    address: string
): Promise<Currency | undefined> {
    return getTokens(supportedChainId).then(([, map]) => map.get(address))
}
