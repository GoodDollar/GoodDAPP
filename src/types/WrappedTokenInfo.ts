import { Token } from '@sushiswap/sdk'
import { Tags, TokenInfo } from '@uniswap/token-lists'
import { isAddressString } from 'utils'

type TagDetails = Tags[keyof Tags]

export interface TagInfo extends TagDetails {
    id: string
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
    constructor(public readonly tokenInfo: TokenInfo, public readonly tags: TagInfo[]) {
        super(
            tokenInfo.chainId,
            isAddressString(tokenInfo.address),
            tokenInfo.decimals,
            tokenInfo.symbol,
            tokenInfo.name
        )
    }

    get logoURI(): string | undefined {
        return this.tokenInfo.logoURI
    }
}
