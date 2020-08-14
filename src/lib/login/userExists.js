// @flow
import { APIService } from '../API/api'
import { GoodWallet } from '../wallet/GoodWalletClass'
import GoodWalletLogin from './GoodWalletLoginClass'
export const userExists = async (mnemonics): Promise<any> => {
  const wallet = new GoodWallet({ mnemonic: mnemonics })
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
