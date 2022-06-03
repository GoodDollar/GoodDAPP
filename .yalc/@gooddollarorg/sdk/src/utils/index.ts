import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import Fraction from 'entities/Fraction'
import { ethers } from 'ethers'
import { getAddress } from '@ethersproject/address'

export const formatFromBalance = (value: BigNumber | undefined, decimals = 18): string => {
    if (value) {
        return Fraction.from(BigNumber.from(value), BigNumber.from(10).pow(decimals)).toString()
    } else {
        return ''
    }
}
export const formatToBalance = (value: string | undefined, decimals = 18): {value: BigNumber, decimals: number} => {
    if (value) {
        return { value: ethers.utils.parseUnits(Number(value).toFixed(decimals), decimals), decimals: decimals }
    } else {
        return { value: BigNumber.from(0), decimals: decimals }
    }
}

export function isWETH(value: any): string {
    if (value.toLowerCase() === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
        return 'ETH'
    }
    return value
}

export const formatBalance = (value: BigNumberish, decimals = 18, maxFraction = 0) => {
    const formatted = ethers.utils.formatUnits(value, decimals)
    if (maxFraction > 0) {
        const split = formatted.split('.')
        if (split.length > 1) {
            return split[0] + '.' + split[1].substr(0, maxFraction)
        }
    }
    return formatted
}

export const parseBalance = (value: string, decimals = 18): BigNumber => {
    return ethers.utils.parseUnits(value || '0', decimals)
}

export const isEmptyValue = (text: string) =>
    ethers.BigNumber.isBigNumber(text)
        ? ethers.BigNumber.from(text).isZero()
        : text === '' || text.replace(/0/g, '').replace(/\./, '') === ''

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}
export function isAddressString(value: any): string {
    try {
        return getAddress(value)
    } catch {
        return ''
    }
}
