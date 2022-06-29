// @flow
import { default as API, throwException } from '../API'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'useUserExists' })

const userExists = async ({ mnemonics, privateKey, email, mobile }, goodWallet) => {
  let identifier

  if (goodWallet) {
    identifier = goodWallet.getAccountForType('login')
  }

  if (![identifier, email, mobile].find(_ => _)) {
    return { exists: false }
  }

  try {
    const { data } = await API.userExistsCheck({ identifier, email, mobile }).catch(throwException)

    return data
  } catch (exception) {
    const { message } = exception

    log.error('userExistsCheck failed: ', message, exception)
    throw exception
  }
}

export default userExists
