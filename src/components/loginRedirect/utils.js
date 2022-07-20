// @flow

import { first } from 'lodash'

export const detail = value => ({ value, attestation: '' })

export const addNonceAndSign = (goodWallet, response) => {
  const { wallet, accounts } = goodWallet
  const { accounts: signer } = wallet.eth
  const { privateKey } = first(accounts)

  const completeResponse = { ...response, nonce: detail(Date.now()) }
  const { signature } = signer.sign(JSON.stringify(completeResponse), privateKey)

  return { ...completeResponse, sig: signature }
}
