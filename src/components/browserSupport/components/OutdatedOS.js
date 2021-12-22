// libraries
import React from 'react'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={'Oops! Your iOS is outdated'}
    text={'Please update you iOS'}
    image={illustration}
    imageHeight={124}
    buttons={[
      {
        text: 'GOT IT',
        action: onDismiss,
      },
    ]}
  />
)
