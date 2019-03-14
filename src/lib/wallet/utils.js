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

export const weiToGd = (wei: number): number => wei * Math.pow(0.1, DECIMALS)
export const gdToWei = (gd: number): number => gd * Math.pow(10, DECIMALS)

const getComposedSettings = (settings?: {} = {}): {} => {
  const { showUnits, ...restSettings } = settings
  const customSettings = { suffixUnit: showUnits ? ' GD' : undefined }
  return { ...maskSettings, ...restSettings, ...customSettings }
}

export const toMask = (gd: number, settings?: {}): string => {
  return MaskService.toMask('money', gd, getComposedSettings(settings))
}
export const toRawValue = (masked: string, settings?: {}): number =>
  MaskService.toRawValue('money', masked, getComposedSettings(settings))

export const weiToMask = (wei: number, settings?: {}): string => toMask(weiToGd(wei), settings)
export const maskToWei = (mask: string, settings?: {}): number => gdToWei(toRawValue(mask, settings))
