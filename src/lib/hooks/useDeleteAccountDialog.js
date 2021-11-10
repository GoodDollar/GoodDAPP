import React, { useCallback } from 'react'
import AsyncStorage from '../utils/asyncStorage'

import logger from '../logger/js-logger'
import IconWrapper from '../../components/common/modal/IconWrapper'
import LoadingIcon from '../../components/common/modal/LoadingIcon'
import retryImport from '../utils/retryImport'
import restart from '../utils/restart'

const log = logger.child({ from: 'useDeleteAccountDialog' })

export default ({ API, showErrorDialog, theme }) => {
  const deleteHandler = useCallback(async () => {
    showErrorDialog('', '', {
      title: 'ARE YOU SURE?',
      message: 'If you delete your account',
      boldMessage: 'you might lose access to your G$!',
      image: <LoadingIcon />,
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
  }, [showErrorDialog, API])

  return useCallback(
    () =>
      showErrorDialog('', '', {
        title: 'ARE YOU SURE?',
        message: 'If you delete your account',
        boldMessage: 'you might lose access to your G$!',
        image: <IconWrapper iconName="trash" color={theme.colors.error} size={50} />,
        buttons: [
          { text: 'Cancel', onPress: dismiss => dismiss(), mode: 'text', color: theme.colors.lighterGray },
          {
            text: 'Delete',
            color: theme.colors.red,
            onPress: deleteHandler,
          },
        ],
      }),
    [deleteHandler, theme],
  )
}
