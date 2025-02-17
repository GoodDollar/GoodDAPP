import React, { useCallback } from 'react'
import { useIdentityExpiryDate } from '@gooddollar/web3sdk-v2'
import moment from 'moment'
import { t } from '@lingui/macro'
import logger from '../logger/js-logger'

import DeleteAccountDialog from '../../components/common/dialogs/DeleteAccountDialog'
import { useUserStorage } from '../wallet/GoodWalletProvider'
import AsyncStorage from '../utils/asyncStorage'
import { restart } from '../utils/system'
import { theme } from '../../components/theme/styles'

const log = logger.child({ from: 'useDeleteAccountDialog' })

export default showErrorDialog => {
  const userStorage = useUserStorage()
  const [expiryDate] = useIdentityExpiryDate(userStorage.wallet.account)
  const authPeriod = expiryDate?.authPeriod?.toNumber() || 360
  const expiration = moment().add(authPeriod, 'days').format('l')

  return useCallback(() => {
    const deleteHandler = async () => {
      showErrorDialog('', '', {
        title: t`ARE YOU SURE?`,
        content: <DeleteAccountDialog icon="loading" expiryDate={expiration} />,
        showButtons: false,
      })

      try {
        const isDeleted = await userStorage.deleteAccount()

        log.debug('deleted account', isDeleted)

        if (isDeleted) {
          // remove all local data so its not cached and user will re-login
          await AsyncStorage.clear()
          restart()
        } else {
          const exception = new Error('Received false from userStorage.deleteAccount()')

          log.error('Account is not deleted', exception.message, exception, {
            dialogShown: true,
          })
          showErrorDialog('There was a problem deleting your account. Try again later.')
        }
      } catch (e) {
        log.error('Error deleting account', e.message, e, { dialogShown: true })
        showErrorDialog('There was a problem deleting your account. Try again later.')
      }
    }

    showErrorDialog('', '', {
      title: 'ARE YOU SURE?',
      content: <DeleteAccountDialog expiryDate={expiration} />,
      buttons: [
        { text: 'Cancel', onPress: dismiss => dismiss(), mode: 'text', color: theme.colors.lighterGray },
        {
          text: 'Delete',
          color: theme.colors.red,
          onPress: deleteHandler,
        },
      ],
    })
  }, [showErrorDialog, userStorage])
}
