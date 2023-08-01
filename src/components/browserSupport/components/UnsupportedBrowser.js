// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'
import Config from '../../../config/config'
import mustache from '../../../lib/utils/mustache'

// localization

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Oops! GoodWallet might not work correctly on webviews`}
    text={
      t`For best experience` +
      `\n` +
      t`please switch to your browser app``\n` +
      mustache(t`and go to { publicUrl }`, Config)
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

const { showDialog } = useDialog()

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
