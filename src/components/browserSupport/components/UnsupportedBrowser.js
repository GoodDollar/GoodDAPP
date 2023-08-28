// libraries
import React from 'react'
import { t } from '@lingui/macro'
import { noop } from 'lodash'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import { useClipboardCopy } from '../../../lib/hooks/useClipboard'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

import Config from '../../../config/config'
import { useDialog } from '../../../lib/dialog/useDialog'

// localization

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Oops! GoodWallet might not work correctly on webviews`}
    text={t`For best experience 
    please switch to your browser app
    and go to ${Config.publicUrl}`}
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
export const BlockingUnsupportedBrowser = ({ onDismiss = noop, copyUrl = undefined }) => {
  const { showDialog } = useDialog()

  const navigateTo = copyUrl ?? Config.publicUrl

  const _onCopy = () => {
    showDialog({
      isMinHeight: false,
      showButtons: false,
      onDismiss: noop,
      title: t`Link copied to clipboard`,
    })
  }

  const copyToClipboard = useClipboardCopy(navigateTo, _onCopy)

  return (
    <ExplanationDialog
      title={t`Oops! This browser/app cannot run identity verification`}
      text={t`Please copy the link and open it on Chrome, Safari, or your native browser.`}
      image={illustration}
      imageHeight={124}
      buttons={[
        {
          text: t`Copy link`,
          action: copyToClipboard,
        },
        {
          text: `Try Anyway`,
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
