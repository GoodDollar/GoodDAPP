// libraries
import React, { useCallback } from 'react'

import { retry } from '../../../lib/utils/async'
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

  const { count, last, country } = (await AsyncStorage.getItem(STORAGE_KEY)) || {
    count: 0,
    last: 0,
    country: undefined,
  }

  let userCountry = country
  if (!userCountry) {
    userCountry = await retry(
      async () => (await fetch('https://get.geojs.io/v1/ip/country.json')).json(),
      3,
      2000,
    ).then(data => data.country)
    AsyncStorage.setItem(STORAGE_KEY, { count, last, country: userCountry })
  }

  if (userCountry === 'GB' && Date.now() > last + BACKOFF * 2 ** count) {
    AsyncStorage.setItem(STORAGE_KEY, { count: count === 5 ? 1 : count + 1, last: Date.now(), country: userCountry })
    return true
  }

  return false
}

const DeprecationDialog = () => {
  const goToWallet = () => {
    openLink('https://wallet.gooddollar.org', '_blank')
  }

  return (
    <ExplanationDialog
      title={'UK Users!'}
      text={`Following September 12, 2024, \n support for the GoodWallet on Android in the UK will be limited. \n As all GoodWallet users, UK-based users can use the web-app version of GoodWallet through a compatible web browser at https://wallet.gooddollar.org`}
      textStyle={{
        fontSize: normalizeText(16),
        marginVertical: getDesignRelativeHeight(25, false),
      }}
      buttons={[
        {
          text: `Launch GoodWallet in browser`,
          action: goToWallet,
        },
      ]}
      buttonsContainerStyle={{ justifyContent: 'center' }}
      buttonText={{ fontSize: normalizeText(10) }}
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
