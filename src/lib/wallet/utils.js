// @flow

import { MaskService } from 'react-native-masked-text'
import { get, map, zipObject } from 'lodash'

const DECIMALS = 2

const maskSettings = {
  precision: DECIMALS,
  separator: '.',
  delimiter: ',',
  unit: '',
  suffixUnit: '',
}

const ethAddressRegex = /0x[a-fA-F0-9]{40}/
export const extractEthAddress = uri => get(uri.match(ethAddressRegex), '0', null)

export const moneyRegexp = new RegExp(`^(?!0\\d)(0|([1-9])\\d*)([.,]?(\\d{0,${DECIMALS}}))$`)
export const numberWithCommas = (gd: string): string => gd.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/**
 * convert wei to gooddollars (2 decimals) use toFixed to overcome javascript precision issues ie 8.95*100=894.9999...
 * @param {number} wei
 * @returns {string}
 */
export const weiToGd = (wei: number): string => (wei * Math.pow(0.1, DECIMALS)).toFixed(wei % 100 === 0 ? 0 : DECIMALS)

/**
 * convert gooddollars to wei (0 decimals) use toFixed to overcome javascript precision issues ie 8.95*Math.pow(0.1,2)=8.9500000001
 * @param {string} gd
 * @returns {string}
 */
export const gdToWei = (gd: string): string => (gd * Math.pow(10, DECIMALS)).toFixed(0)

const getComposedSettings = (settings?: {} = {}): {} => {
  const { showUnits, ...restSettings } = settings
  const customSettings = { suffixUnit: showUnits ? ' G$' : undefined }
  return { ...maskSettings, ...restSettings, ...customSettings }
}

export const toMask = (gd?: number, settings?: {}): string => {
  const precision = gd && gd % 1 !== 0 ? maskSettings.precision : 0
  return gd ? MaskService.toMask('money', gd, { ...getComposedSettings(settings), precision }) : null
}
export const toRawValue = (masked: string, settings?: {}): number =>
  MaskService.toRawValue('money', masked, getComposedSettings(settings))

export const weiToMask = (wei: number, settings?: {}): string => toMask(weiToGd(wei), settings)
export const maskToWei = (mask: string, settings?: {}): number => gdToWei(toRawValue(mask, settings))

export const getTxLogArgs = tx => {
  try {
    const { arguments: _args, _method, transactionHash } = tx
    const { inputs, name, signature } = _method
    const args = zipObject(map(inputs, 'name'), _args)

    return {
      method: name,
      signature,
      args,
      transactionHash,
    }
  } catch {
    return {
      method: 'unknown',
      signature: null,
      args: {},
    }
  }
}

export const isMetamaskProvider = provider =>
  provider?.isMetaMask || provider?.walletMeta?.name?.toLowerCase() === 'metamask'
export const isWalletConnectProvider = provider => provider?.isWalletConnect

export const getProviderSupplier = provider => {
  // must check for walletconnect before metamask cause metamask provider may be supplied by walletconnect
  if (isWalletConnectProvider(provider)) {
    return 'walletconnect'
  }
  if (isMetamaskProvider(provider)) {
    return 'metamask'
  }
  return null
}
