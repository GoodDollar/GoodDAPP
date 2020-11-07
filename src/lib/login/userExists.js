// @flow
import { default as API } from '../API/api'
import { GoodWallet } from '../wallet/GoodWalletClass'

export const userExists = async ({ mnemonics, privateKey, email, mobile }): Promise<any> => {
  const wallet = new GoodWallet({ mnemonic: mnemonics || privateKey })
  await wallet.ready
  const identifier = wallet.getAccountForType('login')
  const { data } = await API.userExistsCheck({ identifier, email, mobile })

  return data
}
