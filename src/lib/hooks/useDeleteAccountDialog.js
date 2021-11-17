import React, { useCallback } from 'react'
import { Text } from 'react-native'

import AsyncStorage from '../utils/asyncStorage'

import logger from '../logger/js-logger'
import IconWrapper from '../../components/common/modal/IconWrapper'
import LoadingIcon from '../../components/common/modal/LoadingIcon'
import ExplanationDialog from '../../components/common/dialogs/ExplanationDialog'
import { theme } from '../../components/theme/styles'
import retryImport from '../utils/retryImport'
import restart from '../utils/restart'
import normalizeText from '../../lib/utils/normalizeText'

const log = logger.child({ from: 'useDeleteAccountDialog' })

const TrashIcon = () => <IconWrapper iconName="trash" color={theme.colors.error} size={50} />

const MessageTextComponent = () => (
  <Text style={{ color: theme.colors.error, fontSize: normalizeText(18) }}>
    If you delete your account <br /> <Text style={{ fontWeight: 'bold' }}> you might lose access to your G$!</Text>
  </Text>
)

export default ({ API, showErrorDialog, theme }) => {
  const deleteHandler = useCallback(async () => {
    showErrorDialog('', '', {
      title: 'ARE YOU SURE?',
      content: (
        <ExplanationDialog
          image={LoadingIcon}
          label={<MessageTextComponent />}
          text={'For security reasons, it might take up to 48 hours for your data to be completely removed.'}
          textStyle={{
            fontSize: normalizeText(16),
            color: theme.colors.lighterGray,
            lineHeight: normalizeText(18),
            textAlign: 'center',
          }}
          labelStyle={{ textAlign: 'center', lineHeight: normalizeText(18) }}
        />
      ),
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
        content: (
          <ExplanationDialog
            image={TrashIcon}
            label={<MessageTextComponent />}
            text={'For security reasons, it might take up to 48 hours for your data to be completely removed.'}
            textStyle={{
              fontSize: normalizeText(16),
              color: theme.colors.lighterGray,
              lineHeight: normalizeText(18),
              textAlign: 'center',
            }}
            labelStyle={{ textAlign: 'center', lineHeight: normalizeText(18) }}
          />
        ),
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
