// @flow

import { MaskService } from 'react-native-masked-text'
const DECIMALS = 2

const maskSettings = {
  precision: DECIMALS,
  separator: '.',
  delimiter: ',',
  unit: '',
  suffixUnit: ''
}

export const moneyRegexp = /^(\d+)([.]?(\d{0,2}))$/g

/**
 * convert wei to gooddollars (2 decimals) use toFixed to overcome javascript precision issues ie 8.95*100=894.9999...
 * @param {number} wei
 * @returns {string}
 */
export const weiToGd = (wei: number): string => {
  const amount = wei * Math.pow(0.1, DECIMALS)
  return amount > 0 ? numberWithCommas(amount.toFixed(DECIMALS)) : ''
}

export const numberWithCommas = (gd: string): string => gd.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/**
 * convert gooddollars to wei (0 decimals) use toFixed to overcome javascript precision issues ie 8.95*Math.pow(0.1,2)=8.9500000001
 * @param {number | string} gd
 * @returns {number}
 */
export const gdToWei = (gd: string): number => {
  const amount = gd.replace(',', '')
  return (Number(amount) * Math.pow(10, DECIMALS)).toFixed(0)
}

const getComposedSettings = (settings?: {} = {}): {} => {
  const { showUnits, ...restSettings } = settings
  const customSettings = { suffixUnit: showUnits ? ' G$' : undefined }
  return { ...maskSettings, ...restSettings, ...customSettings }
}

export const toMask = (gd?: number, settings?: {}): string => {
  return gd ? MaskService.toMask('money', gd, getComposedSettings(settings)) : null
}
export const toRawValue = (masked: string, settings?: {}): number =>
  MaskService.toRawValue('money', masked, getComposedSettings(settings))

export const weiToMask = (wei: number, settings?: {}): string => weiToGd(wei)
export const maskToWei = (value: string, settings?: {}): number => gdToWei(value)
