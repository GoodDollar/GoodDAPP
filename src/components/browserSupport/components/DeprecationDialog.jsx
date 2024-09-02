// libraries
import React, { useCallback } from 'react'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import { useDialog } from '../../../lib/dialog/useDialog'

// utils
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { openLink } from '../../../lib/utils/linking'

const STORAGE_KEY = 'deprecationDialogShownCount'
const RESET_THRESHOLD = 0.1 // Reset when probability drops to 10%

const onCloseDeprecationDialog = () => {
  const count = parseInt(localStorage.getItem(STORAGE_KEY)) || 0
  localStorage.setItem(STORAGE_KEY, (count + 1).toString())
}

export const shouldShowDeprecationDialog = () => {
  const count = parseInt(localStorage.getItem(STORAGE_KEY)) || 0

  // Always show for the first 3 visits
  if (count < 3) {
    return true
  }

  // we gradually decrease the probability of showing the dialog
  const probability = 1 / (count - 2)

  // Reset if the probability drops below the threshold
  if (probability < RESET_THRESHOLD) {
    localStorage.setItem(STORAGE_KEY, '0')
    return true
  }

  return Math.random() < probability
}

const DeprecationDialog = () => {
  const goToWallet = () => {
    onCloseDeprecationDialog()
    openLink('https://wallet.gooddollar.org', '_blank')
  }

  return (
    <ExplanationDialog
      title={'UK Users!'}
      text={`Following September 12, 2024, support for the GoodWallet on Android in the UK will be limited. As all GoodWallet users, UK-based users can use the web-app version of GoodWallet through a compatible web browser at https://wallet.gooddollar.org`}
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
      onDismiss: onCloseDeprecationDialog,
    })
  }, [showDialog])

  return { showDeprecationDialog }
}
