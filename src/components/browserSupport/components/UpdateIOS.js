// libraries
import React from 'react'

// components
import { t, Trans } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'
import Config from '../../../config/config'

// localization

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Oops! Your iOS is outdated`}
    text={
      <>
        <Trans>{'Please update your iOS to access GoodDollar.\nMinimum version required: iOS '}</Trans>
        {Config.minimalIOSVersion}
      </>
    }
    image={illustration}
    imageHeight={124}
    buttons={[
      {
        text: t`OK, GOT IT`,
        action: onDismiss,
      },
    ]}
  />
)
