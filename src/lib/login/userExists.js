//@flow
import API from '../../lib/API/api'
import retryImport from '../../lib/utils/retryImport'

export const userExists = async (mnemonics): Promise<any> => {
  const [Wallet, GoodWalletLogin] = await Promise.all([
    retryImport(() => import('../../lib/wallet/GoodWalletClass').then(_ => _.GoodWallet)),
    retryImport(() => import('../../lib/login/GoodWalletLogin').then(_ => _.GoodWalletLogin)),
  ])
  const wallet = new Wallet({ mnemonic: mnemonics })
  await wallet.ready
  const login = new GoodWalletLogin(wallet, null)
  await login.auth()
  await API.init()
  const {
    data: { exists, fullName },
  } = await API.userExists()
  return { exists, fullName }
}
