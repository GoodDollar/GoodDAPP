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

  if (![identifier, email, mobile].find(_ => _)) {
    return { exists: false }
  }

  const { data } = await API.userExistsCheck({ identifier, email, mobile })

  return data
}
