import React, { useCallback } from 'react'

import logger from '../logger/js-logger'

import DeleteAccountDialog from '../../components/common/dialogs/DeleteAccountDialog'

import AsyncStorage from '../utils/asyncStorage'
import retryImport from '../utils/retryImport'
import restart from '../utils/restart'

import { theme } from '../../components/theme/styles'

const log = logger.child({ from: 'useDeleteAccountDialog' })

export default showErrorDialog =>
  useCallback(() => {
    const deleteHandler = async () => {
      showErrorDialog('', '', {
        title: 'ARE YOU SURE?',
        content: <DeleteAccountDialog icon="loading" />,
        showButtons: false,
      })

      try {
        const userStorage = await retryImport(() => import('../userStorage/UserStorage')).then(_ => _.default)

        const isDeleted = await userStorage.deleteAccount()
        log.debug('deleted account', isDeleted)

        if (isDeleted) {
          // remove all local data so its not cached and user will re-login
          await AsyncStorage.clear()
          restart()
        } else {
          log.error(
            'Error deleting account',
            'Received false from userStorage.deleteAccount()',
            new Error('Account is not deleted'),
            {
              dialogShown: true,
            },
          )
          showErrorDialog('There was a problem deleting your account. Try again later.')
        }
      } catch (e) {
        log.error('Error deleting account', e.message, e, { dialogShown: true })
        showErrorDialog('There was a problem deleting your account. Try again later.')
      }
    }

    showErrorDialog('', '', {
      title: 'ARE YOU SURE?',
      content: <DeleteAccountDialog />,
      buttons: [
        { text: 'Cancel', onPress: dismiss => dismiss(), mode: 'text', color: theme.colors.lighterGray },
        {
          text: 'Delete',
          color: theme.colors.red,
          onPress: deleteHandler,
        },
      ],
    })
  }, [showErrorDialog])
