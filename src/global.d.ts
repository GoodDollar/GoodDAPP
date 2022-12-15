import { BigNumber } from '@ethersproject/bignumber'

declare global {
    interface String {
        toBigNumber(decimals: number): BigNumber
    }
    interface Window {
        dataLayer: any
    }
}
