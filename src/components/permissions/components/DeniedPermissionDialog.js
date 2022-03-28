// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default ({ onDismiss, navigate, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    buttons={[
      {
        text: t`How to do that?`,
        action: () => {
          onDismiss()
          navigate('Support')
        },
        mode: 'text',
      },
    ]}
  />
)
