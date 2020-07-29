// @flow
import { APIService } from '../API/api'
import retryImport from '../utils/retryImport'

export const userExists = async (mnemonics): Promise<any> => {
  const [Wallet, GoodWalletLogin] = await Promise.all([
    retryImport(() => import('../wallet/GoodWalletClass').then(_ => _.GoodWallet)),
    retryImport(() => import('./GoodWalletLogin').then(_ => _.GoodWalletLogin)),
  ])

  const wallet = new Wallet({ mnemonic: mnemonics })
  await wallet.ready

  const login = new GoodWalletLogin(wallet, null)
  const creds = await login.login()
  const { jwt } = await login.requestJWT(creds)

  const api = new APIService(jwt)
  await api.ready

  const {
    data: { exists, fullName },
  } = await api.userExists()

  return { exists, fullName }
}
