import { get } from 'lodash'

import API from '../API/api'
import userStorage from '../userStorage/UserStorage'

const fromDate = new Date('2021/09/09')

const restoreProfile = async (lastUpdate, prevVersion, log) => {
  let { fullName, walletAddress } = userStorage.getDisplayProfile()

  log.info('start restoreProfile')
  log.info('got full name and wallet address:', { fullName, walletAddress })

  if (fullName && walletAddress) {
    log.info('full name and address are set, skipping')
    return
  }

  const { wallet } = userStorage
  const identifier = wallet.getAccountForType('login')

  if (!walletAddress) {
    walletAddress = wallet.account
  }

  if (!fullName) {
    const { data } = await API.userExistsCheck({ identifier }).catch(e => {
      log.error('failed getting fullName from API call', e.message, e)
      throw e
    })

    const fullNameFromServer = get(data, 'fullName')

    if (!fullNameFromServer) {
      const e = new Error('Received empty fullName from API call')

      log.error('fullName update failed', e.message, e, { data })
      throw e
    }

    fullName = fullNameFromServer
  }

  log.info('re-fetched user name and address:', { fullName, walletAddress })
  log.info('updating profile')

  await userStorage.setProfile({ fullName, walletAddress }, true)

  log.info('done restoreProfile')
}

export default { fromDate, update: restoreProfile, key: 'restoreProfile' }
