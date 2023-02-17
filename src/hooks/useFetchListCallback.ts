import { nanoid } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../state'
import { fetchTokenList } from '../state/lists/actions'
import getTokenList from '../utils/getTokenList'
import resolveENSContentHash from '../utils/resolveENSContentHash'
import { useActiveWeb3React } from './useActiveWeb3React'
import { SupportedChains } from '@gooddollar/web3sdk-v2'

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
    const { chainId, library } = useActiveWeb3React()
    const dispatch = useDispatch<AppDispatch>()

    const ensResolver = useCallback(
        (ensName: string) => {
            if (library && chainId === (SupportedChains.MAINNET as number)) {
                return resolveENSContentHash(ensName, library)
            } else {
                throw new Error('Could not construct mainnet ENS resolver')
            }
        },
        [chainId, library]
    )

    // note: prevent dispatch if using for list search or unsupported list
    return useCallback(
        async (listUrl: string, sendDispatch = true) => {
            const requestId = nanoid()
            sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl }))
            return getTokenList(listUrl, ensResolver)
                .then((tokenList) => {
                    sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }))
                    return tokenList
                })
                .catch((error) => {
                    console.debug(`Failed to get list at url ${listUrl}`, error)
                    sendDispatch &&
                        dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }))
                    throw error
                })
        },
        [dispatch, ensResolver]
    )
}
