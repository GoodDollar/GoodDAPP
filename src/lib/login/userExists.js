// @flow
import { default as API } from '../API/api'
import { GoodWallet } from '../wallet/WalletClassSelector'

export const userExists = async ({ mnemonics, privateKey, email, mobile }): Promise<any> => {
  const walletSeed = mnemonics || privateKey
  let identifier
  if (walletSeed) {
    const wallet = new GoodWallet({ mnemonic: walletSeed })
    await wallet.ready
    identifier = wallet.getAccountForType('login')
  }
  const { data } = await API.userExistsCheck({ identifier, email, mobile })

  return data
}
