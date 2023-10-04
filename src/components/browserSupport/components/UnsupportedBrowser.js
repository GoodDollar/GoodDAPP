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
import { theme } from '../../theme/styles'

// localization

const webviewCopy = {
  fv: {
    title: t`Oops! This browser/app cannot run identity verification`,
    text: t`Please copy the link and open it on Chrome, Safari, or your native browser.`,
  },
  default: {
    title: t`Oops! GoodWallet might not work correctly on this browser`,
    text: t`GoodWallet might not work correctly on this browser
    For the best experience, use Chrome, Safari or your phone's native browser`,
  },
}

// Modal for blocking user further access to functionality
// Example usage: functionalties which are webviews and we know don't work at all
export const UnsupportedWebview = ({ onDismiss = noop, copyUrl = undefined, type = 'default' }) => {
  const { showDialog } = useDialog()
  const { title, text } = webviewCopy[type]

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
      title={title}
      text={text}
      image={illustration}
      imageHeight={124}
      buttons={[
        {
          text: t`Copy link`,
          action: copyToClipboard,
          style: { backgroundColor: theme.colors.gray80Percent },
        },
        {
          text: t`Try Anyway`,
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
