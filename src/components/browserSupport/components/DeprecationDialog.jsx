// libraries
import React, { useCallback, useContext, useEffect } from 'react'
import { Platform, Text } from 'react-native'
import { t } from '@lingui/macro'

import { isWeb } from '../../../lib/utils/platform'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import { useDialog } from '../../../lib/dialog/useDialog'
import DeepLinking from '../../../lib/utils/deepLinking'
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { openLink } from '../../../lib/utils/linking'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import { useFlagWithPayload } from '../../../lib/hooks/useFeatureFlags'
import { GoodWalletContext } from '../../../lib/wallet/GoodWalletProvider'
import { DEPRECATION_MODAL, fireEvent } from '../../../lib/analytics/analytics'
import { retry } from '../../../lib/utils/async'

const DeprecationCopy = () => (
  <Text
    style={{
      fontSize: normalizeText(18),
      textAlign: 'center',
      fontWeight: 'bold',
      ...Platform.select({ web: { marginBottom: 14 }, android: { marginBottom: getDesignRelativeHeight(32, false) } }),
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
      containerStyle={{ ...Platform.select({ web: { height: '80%' } }) }}
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
  const showDeprecationModal = useFlagWithPayload('show-deprecation-modal')
  const { supportedCountries, enabled: isActive, webOnly, whitelist } = showDeprecationModal || {}
  const { showDialog } = useDialog()
  const { params } = DeepLinking

  const { goodWallet } = useContext(GoodWalletContext)

  const showDeprecationDialog = useCallback(() => {
    showDialog({
      content: <DeprecationDialog />,
      showButtons: false,
      showCloseButtons: false,
    })
  }, [showDialog])

  const showModalIfActive = async () => {
    showDeprecationDialog()

    if (params.isV1 !== undefined) {
      AsyncStorage.setItem('dontShowDeprecationModal', Date.now() + 30 * 24 * 60 * 60 * 1000)
      return
    }
    const until = await AsyncStorage.getItem('dontShowDeprecationModal')
    if (Date.now() <= until) {
      return
    }
    const country = await retry(
      async () => (await fetch('https://get.geojs.io/v1/ip/country.json')).json(),
      3,
      2000,
    ).then(data => data.country)

    const isEligible = supportedCountries?.split(',')?.includes(country) || whitelist?.includes(goodWallet?.account)
    if (((webOnly && isWeb) || !webOnly) && isActive && isEligible) {
      fireEvent(DEPRECATION_MODAL)

      showDeprecationDialog()
    }
  }

  useEffect(() => {
    showModalIfActive()
  }, [showDeprecationModal])
}
