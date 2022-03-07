// @flow
import { default as API } from '../API/api'

export const userExists = async ({ mnemonics, privateKey, email, mobile }, goodWallet): Promise<any> => {
  let identifier
  if (goodWallet) {
    identifier = goodWallet.getAccountForType('login')
  }

  if (![identifier, email, mobile].find(_ => _)) {
    return { exists: false }
  }

  const { data } = await API.userExistsCheck({ identifier, email, mobile })

  return data
}
