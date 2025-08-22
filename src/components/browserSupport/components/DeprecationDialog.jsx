// libraries
import React, { useCallback, useEffect } from 'react'

import MigrationDialog from '../../common/dialogs/MigrationDialog'
import { useDialog } from '../../../lib/dialog/useDialog'
import DeepLinking from '../../../lib/utils/deepLinking'
import { openLink } from '../../../lib/utils/linking'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'
import { DEPRECATION_MODAL, fireEvent } from '../../../lib/analytics/analytics'

const DeprecationDialog = () => {
  const userStorage = useUserStorage()

  const goToWallet = () => {
    const logMethod = userStorage?.userProperties.get('logMethod')
    openLink(`https://goodwallet.xyz?login=${logMethod}`, '_self')
  }

  return <MigrationDialog onDismiss={goToWallet} />
}

export const useDeprecationDialog = () => {
  const showDeprecationModal = true
  const { showDialog } = useDialog()
  const { params } = DeepLinking

  const showDeprecationDialog = useCallback(() => {
    showDialog({
      content: <DeprecationDialog />,
      showButtons: false,
      showCloseButtons: false,
    })
  }, [showDialog])

  const showModalIfActive = async () => {
    if (params.isV1 !== undefined) {
      AsyncStorage.setItem('dontShowDeprecationModal', Date.now() + 30 * 24 * 60 * 60 * 1000)
      return
    }
    const until = await AsyncStorage.getItem('dontShowDeprecationModal')
    if (Date.now() <= until) {
      return
    }

    // if (((webOnly && isWeb) || !webOnly) && isActive && isEligible) {
    fireEvent(DEPRECATION_MODAL)
    showDeprecationDialog()

    // }
  }

  useEffect(() => {
    showModalIfActive()
  }, [showDeprecationModal])
}
