// libraries
import React from 'react'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'
import Config from '../../../config/config'

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={'Oops! Your iOS is outdated'}
    text={`Please update your iOS to access GoodDollar.\nMinimum version required: iOS ${Config.minimalIOSVersion}.`}
    image={illustration}
    imageHeight={124}
    buttons={[
      {
        text: 'OK, GOT IT',
        action: onDismiss,
      },
    ]}
  />
)
