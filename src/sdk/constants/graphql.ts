import { SupportedChainId } from './chains'
import { constructSameAddressMap } from '../utils/constructSameAddressMap'

type AddressMap = { [chainId: number]: string }

export const G$PRICE = 'https://api.thegraph.com/subgraphs/name/gooddollar/goodsubgraphs'

export const AAVE_STAKING: AddressMap = {
    [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
    [SupportedChainId.KOVAN]: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan'
}
