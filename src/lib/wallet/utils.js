import { MaskService } from 'react-native-masked-text'
const DECIMALS = 2

const maskSettings = {
  precision: DECIMALS,
  separator: '.',
  delimiter: ',',
  unit: '',
  suffixUnit: ''
}

export const weiToGd = wei => wei * Math.pow(0.1, DECIMALS)
export const gdToWei = gd => gd * Math.pow(10, DECIMALS)

const getComposedSettings = (settings = {}) => {
  const { showUnits, ...restSettings } = settings
  const customSettings = { suffixUnit: showUnits ? ' GD' : undefined }
  return { ...maskSettings, ...restSettings, ...customSettings }
}

export const toMask = (gd, settings) => {
  return MaskService.toMask('money', gd, getComposedSettings(settings))
}
export const toRawValue = (masked, settings) => MaskService.toRawValue('money', masked, getComposedSettings(settings))

export const weiToMask = (wei, settings) => toMask(weiToGd(wei), settings)
export const maskToWei = (mask, settings) => gdToWei(toRawValue(mask, settings))
