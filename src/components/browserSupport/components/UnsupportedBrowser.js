// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import { useClipboardCopy } from '../../../lib/hooks/useClipboard'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

import Config from '../../../config/config'

// localization

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Oops! GoodWallet might not work correctly on webviews`}
    text={
      t`For the best experience` + `\n` + t`please switch to your browser app` + `\n` + t`and go to ${Config.publicUrl}`
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

// Modal for blocking user further access to functionality
// Example usage: functionalties which are webviews and we know don't work at all
export const BlockingUnsupportedBrowser = ({ onDismiss }) => {
  // todo: get page url
  const navigateTo = 'https://www.google.com'

  // todo: add copy flow, now it just closes modal (does copy)
  const copyToClipboard = useClipboardCopy(navigateTo)

  return (
    <ExplanationDialog
      title={t`Oops! This browser/app is not supported to pass identity verification`}
      text={t`please copy the link and open it in your native browser`}
      image={illustration}
      imageHeight={124}
      buttons={[
        {
          text: t`Copy link`,
          action: copyToClipboard,
        },
        {
          text: `Go back`,
          action: onDismiss,
        },
      ]}
    />
  )
}

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
