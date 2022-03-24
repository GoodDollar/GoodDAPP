// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// utils
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { isIOSWeb } from '../../../lib/utils/platform'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

// localization

export default () => (
  <ExplanationDialog
    title={
      isIOSWeb ? t`Please switch to\nSafari browser` : t`For best user\nexperience switch to\nChrome or Safari browsers`
    }
    text={isIOSWeb ? t`This browser doesn’t support\ncamera access on iOS devices. Sorry!` : null}
    textStyle={{
      fontSize: normalizeText(16),
      marginVertical: getDesignRelativeHeight(25, false),
    }}
    image={illustration}
    imageHeight={124}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <SwitchToChromeOrSafari />,
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
