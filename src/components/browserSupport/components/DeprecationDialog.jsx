// libraries
import React, { useCallback } from 'react'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import { useDialog } from '../../../lib/dialog/useDialog'

// utils
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { openLink } from '../../../lib/utils/linking'

const DeprecationDialog = () => {
  const goToWallet = () => {
    openLink('https://wallet.gooddollar.org', '_blank')
  }

  return (
    <ExplanationDialog
      title={'Notice to UK users'}
      text={`To continue using GoodWallet, please access GoodWallet using a web browser at https://wallet.gooddollar.org. \n Support for GoodWallet on Android in the UK will be limited after 12 September.`}
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
    })
  }, [showDialog])

  return { showDeprecationDialog }
}
