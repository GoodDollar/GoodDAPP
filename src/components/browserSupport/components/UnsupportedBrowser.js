// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// utils
import { isIOSWeb } from '../../../lib/utils/platform'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

// localization

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Oops! This browser isn't supported`}
    text={
      t`For best experience` +
      `\n` +
      (isIOSWeb ? t`on iOS please switch to Safari` : t`please switch to Chrome or Safari`)
    }
    image={illustration}
    imageHeight={124}
    buttons={[
      {
        text: t`GOT IT`,
        action: onDismiss,
      },
    ]}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <UnsupportedBrowser />,
  isMinHeight: false,
  showButtons: false,
  buttons: [
    {
      text: 'OK',
      onPress: dismiss => {
        // do something
        dismiss()
      },
    },
  ],
})
*/
