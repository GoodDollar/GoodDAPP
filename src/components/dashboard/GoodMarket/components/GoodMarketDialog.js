import React from 'react'

import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

import illustration from '../../../../assets/GoodMarket.svg'

export default ({ onDismiss, onGotoMarket, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    title="Check out GoodMarket"
    text={`Visit GoodMarket, our exclusive Facebook marketplace, where you can buy and sell items in exchange for G$ coins.`}
    imageSource={illustration}
    buttons={[
      {
        text: "LET'S GO",
        action: () => {
          onDismiss()
          onGotoMarket()
        },
      },
    ]}
  />
)
