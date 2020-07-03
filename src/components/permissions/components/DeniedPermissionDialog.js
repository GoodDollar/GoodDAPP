// libraries
import React from 'react'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default ({ onDismiss, navigate, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    buttons={[
      {
        text: 'How to do that?',
        action: () => {
          onDismiss()
          navigate('Support')
        },
        mode: 'text',
      },
    ]}
  />
)
