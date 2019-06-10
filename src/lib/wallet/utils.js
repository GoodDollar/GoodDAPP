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

/**
 * convert wei to gooddollars (2 decimals) use toFixed to overcome javascript precision issues ie 8.95*100=894.9999...
 * @param {number} wei
 * @returns {number}
 */
export const weiToGd = (wei: number): number => (wei * Math.pow(0.1, DECIMALS)).toFixed(DECIMALS)

/**
 * convert gooddollars to wei (0 decimals) use toFixed to overcome javascript precision issues ie 8.95*Math.pow(0.1,2)=8.9500000001
 * @param {number} gd
 * @returns {number}
 */
export const gdToWei = (gd: number): number => (gd * Math.pow(10, DECIMALS)).toFixed(0)

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

export const weiToMask = (wei: number, settings?: {}): string => toMask(weiToGd(wei), settings)
export const maskToWei = (mask: string, settings?: {}): number => gdToWei(toRawValue(mask, settings))
