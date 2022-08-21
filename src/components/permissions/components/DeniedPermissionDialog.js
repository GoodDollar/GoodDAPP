// libraries
import React, { useCallback } from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default ({ onDismiss, navigate, ...dialogProps }) => {
  const navigateToSupport = useCallback(() => {
    onDismiss()
    navigate('Support')
  }, [onDismiss, navigate])

  return (
    <ExplanationDialog
      {...dialogProps}
      buttons={[
        {
          text: t`How to do that?`,
          action: navigateToSupport,
          mode: 'text',
        },
        {
          text: t`Maybe later`,
          action: onDismiss,
          mode: 'text',
        },
      ]}
    />
  )
}
