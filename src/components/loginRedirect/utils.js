// @flow

export const detail = value => ({ value, attestation: '' })

export const addNonceAndSign = async (goodWallet, response) => {
  const completeResponse = { ...response, nonce: detail(Date.now()) }
  const signature = await goodWallet.sign(JSON.stringify(completeResponse))

  return { ...completeResponse, sig: signature }
}
