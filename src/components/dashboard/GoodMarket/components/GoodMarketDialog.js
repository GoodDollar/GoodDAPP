import React, { useMemo } from 'react'

import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

// import normalizeText from '../../../../lib/utils/normalizeText'
import { withStyles } from '../../../../lib/styles'

import illustration from '../../../../assets/GoodMarket.svg'
import { getFormattedDateTime } from '../../../../lib/utils/FormatDate'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

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
      resizeMode={false}
      imageHeight={76}
      fullHeight
      buttons={[
        {
          text: "LET'S GO",
          action: onGotoMarket,
        },
      ]}
    />
  )
}

const mapStylesToProps = ({ theme }) => ({
  title: {
    paddingTop: getDesignRelativeHeight(20),
    paddingBottom: getDesignRelativeHeight(20),
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: theme.colors.primary,
    fontSize: 22,
    textAlign: 'left',
    color: theme.colors.darkGray,
    lineHeight: 25,
    marginBottom: 20,
    fontWeight: 500,
  },
  text: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
    color: theme.colors.darkGray,
    fontWeight: 400,
    flex: 1,
  },
  label: {
    marginBottom: 20,
    color: theme.colors.darkGray,
    fontSize: 10,
    lineHeight: 11,
    textAlign: 'left',
  },
  imageStyle: {
    maxHeigth: getDesignRelativeHeight(74),
    marginBottom: getDesignRelativeHeight(36),
  },
})

export default withStyles(mapStylesToProps)(GoodMarketDialog)
