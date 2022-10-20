import { Token } from '@sushiswap/sdk'
import { useMemo } from 'react'
import { useUserAddedTokens } from 'state/user/hooks'
import { TokenAddressMap, useCombinedActiveList, useCombinedInactiveList } from '../state/lists/hooks'
import { useActiveWeb3React } from './useActiveWeb3React'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap, includeUserAdded: boolean): { [address: string]: Token } {
    const { chainId } = useActiveWeb3React()
    const userAddedTokens = useUserAddedTokens()

    return useMemo(() => {
        if (!chainId) return {}

        // reduce to just tokens
        const mapWithoutUrls = Object.keys(tokenMap[chainId] || []).reduce<{ [address: string]: Token }>(
            (newMap, address) => {
                newMap[address] = tokenMap[chainId][address].token
                return newMap
            },
            {}
        )

        if (includeUserAdded) {
            return (
                userAddedTokens
                    // reduce into all ALL_TOKENS filtered by the current chain
                    .reduce<{ [address: string]: Token }>(
                        (tokenMap, token) => {
                            tokenMap[token.address] = token
                            return tokenMap
                        },
                        // must make a copy because reduce modifies the map, and we do not
                        // want to make a copy in every iteration
                        { ...mapWithoutUrls }
                    )
            )
        }

        return mapWithoutUrls
    }, [chainId, userAddedTokens, tokenMap, includeUserAdded])
}

export function useAllTokens(): { [address: string]: Token } {
    const allTokens = useCombinedActiveList()
    return useTokensFromMap(allTokens, true)
}

export function useAllInactiveTokens(): { [address: string]: Token } {
    // get inactive tokens
    const inactiveTokensMap = useCombinedInactiveList()
    const inactiveTokens = useTokensFromMap(inactiveTokensMap, false)

    // filter out any token that are on active list
    const activeTokensAddresses = Object.keys(useAllTokens())
    const filteredInactive = activeTokensAddresses
        ? Object.keys(inactiveTokens).reduce<{ [address: string]: Token }>((newMap, address) => {
              if (!activeTokensAddresses.includes(address)) {
                  newMap[address] = inactiveTokens[address]
              }
              return newMap
          }, {})
        : inactiveTokens

    return filteredInactive
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
    const activeTokens = useAllTokens()

    if (!activeTokens || !token) {
        return false
    }

    return !!activeTokens[token.address]
}
