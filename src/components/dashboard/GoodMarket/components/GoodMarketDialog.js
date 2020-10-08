import React, { useMemo } from 'react'

import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

// import normalizeText from '../../../../lib/utils/normalizeText'
import { withStyles } from '../../../../lib/styles'

import illustration from '../../../../assets/GoodMarket.svg'
import { getFormattedDateTime } from '../../../../lib/utils/FormatDate'

const GoodMarketDialog = ({ onGotoMarket, styles, ...dialogProps }) => {
  const currentDateTime = useMemo(() => getFormattedDateTime(), [])

  return (
    <ExplanationDialog
      {...dialogProps}
      label={currentDateTime}
      title="Check out GoodMarket"
      text={
        `Visit GoodMarket, our exclusive Facebook marketplace, ` +
        `where you can buy and sell items in exchange for G$ coins.`
      }
      imageSource={illustration}
      labelStyle={styles.label}
      titleStyle={styles.title}
      textStyle={styles.text}
      imageStyle={styles.image}
      buttons={[
        {
          text: "LET'S GO",
          action: onGotoMarket,
        },
      ]}
    />
  )
}

const mapStylesToProps = () => ({
  title: {
    // TODO: adjust title style & add blue top/bottom bordfers
  },
  text: {
    // TODO: adjust text style
  },
  label: {
    // TODO: adjust label style
  },
  imageStyle: {
    // TODO: adjust image style
  },
})

export default withStyles(mapStylesToProps)(GoodMarketDialog)
