// @flow

import { first } from 'lodash'
import API from '../../lib/API/api'
import { openLink } from '../../lib/utils/linking'
import { encodeBase64Params } from '../../lib/utils/uri'
import { exitApp } from '../../lib/utils/system'

export const detail = value => ({ value, attestation: '' })

export const addNonceAndSign = (goodWallet, response) => {
  const { wallet, accounts } = goodWallet
  const { accounts: signer } = wallet.eth
  const { privateKey } = first(accounts)

  const completeResponse = { ...response, nonce: detail(Date.now()) }
  const { signature } = signer.sign(JSON.stringify(completeResponse), privateKey)

  return { ...completeResponse, sig: signature }
}

export const redirectTo = async (url, type: 'rdu' | 'cbu', response, log) => {
  if (type === 'rdu') {
    return openLink(`${url}?login=${encodeBase64Params(response)}`, '_self')
  }

  try {
    await API.sendLoginVendorDetails(url, response)
  } catch (e) {
    log.warn('Error sending login vendor details', e.message, e)
  } finally {
    exitApp()
  }
}
