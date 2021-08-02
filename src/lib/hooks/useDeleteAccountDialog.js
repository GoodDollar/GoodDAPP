import React, { useCallback } from 'react'
import AsyncStorage from '../utils/asyncStorage'

import logger from '../logger/pino-logger'
import IconWrapper from '../../components/common/modal/IconWrapper'
import LoadingIcon from '../../components/common/modal/LoadingIcon'
import retryImport from '../utils/retryImport'
import restart from '../utils/restart'
import { isMobileNative } from '../utils/platform'

const log = logger.child({ from: 'useDeleteAccountDialog' })

export const deleteGunDB = () => {
  return new Promise((res, rej) => {
    const openreq = indexedDB.open('radata')
    openreq.onerror = e => res()
    openreq.onsuccess = e => {
      const db = openreq.result
      var transaction = db.transaction(['radata'], 'readwrite')
      transaction.onerror = e => res()

      // create an object store on the transaction
      const objectStore = transaction.objectStore('radata')

      // Make a request to clear all the data out of the object store
      const objectStoreRequest = objectStore.clear()

      objectStoreRequest.onsuccess = res
      objectStoreRequest.onerror = () => rej(objectStoreRequest.error)
    }
  })
}

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
        const req = isMobileNative ? Promise.resolve() : deleteGunDB()

        // remove all local data so its not cached and user will re-login
        await Promise.all([AsyncStorage.clear(), req.catch()])

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
