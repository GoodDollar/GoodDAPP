// libraries
import React, { useCallback } from 'react'
import { Platform, Text } from 'react-native'
import { t } from '@lingui/macro'

import { isAndroidNative } from '../../../lib/utils/platform'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import { useDialog } from '../../../lib/dialog/useDialog'

// utils
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { openLink } from '../../../lib/utils/linking'
import AsyncStorage from '../../../lib/utils/asyncStorage'

const STORAGE_KEY = 'deprecationDialogNextShow'
const BACKOFF = 1000 * 60 * 60 * 12

export const shouldShowDeprecationDialog = async () => {
  if (!isAndroidNative) {
    return false
  }

  const { count, last } = (await AsyncStorage.getItem(STORAGE_KEY)) || {
    count: 0,
    last: 0,
  }

  if (Date.now() > last + BACKOFF * 2 ** count) {
    AsyncStorage.setItem(STORAGE_KEY, { count: count === 5 ? 1 : count + 1, last: Date.now() })
    return true
  }

  return false
}

const DeprecationCopy = () => (
  <Text
    style={{
      fontSize: normalizeText(18),
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 12,
    }}
    {...Platform.select({ android: { marginVertical: getDesignRelativeHeight(25, false) } })}
  >
    {t`To continue using GoodWallet, please access 
the New GoodWallet using a web browser https://goodwallet.xyz/`}
  </Text>
)

const DeprecationDialog = () => {
  const goToWallet = () => {
    openLink('https://goodwallet.xyz', '_blank')
  }

  return (
    <ExplanationDialog
      title={'The New GoodWallet!'}
      customText={<DeprecationCopy />}
      containerStyle={{ height: '80%' }}
      titleStyle={{ fontWeight: 'normal', margin: 0 }}
      textStyle={{
        fontSize: normalizeText(16),

        marginVertical: {
          ...Platform.select({
            android: getDesignRelativeHeight(25, false),
          }),
        },
      }}
      buttons={[
        {
          text: `Launch GoodWallet in browser`,
          action: goToWallet,
        },
      ]}
      buttonsContainerStyle={{ justifyContent: 'center' }}
      buttonText={{ fontSize: 14, fontWeight: 'bold' }}
    />
  )
}

export const useDeprecationDialog = () => {
  const { showDialog } = useDialog()

  const showDeprecationDialog = useCallback(() => {
    showDialog({
      content: <DeprecationDialog />,
      showButtons: false,
      showCloseButtons: true,
    })
  }, [showDialog])

  return { showDeprecationDialog }
}
