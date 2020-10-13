import React, { useMemo } from 'react'

import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

import { getFormattedDateTime } from '../../../../lib/utils/FormatDate'

import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import GoodMarketImage from './GoodMarketImage'

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
      image={GoodMarketImage}
      labelStyle={styles.label}
      titleStyle={styles.title}
      textStyle={styles.text}
      imageContainer={styles.imageContainer}
      containerStyle={styles.container}
      imageStyle={styles.imageStyle}
      resizeMode={false}
      imageHeight={76}
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
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '700',
    fontFamily: theme.fonts.slab,
  },
  text: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
    color: theme.colors.darkGray,
    fontWeight: '400',
    flex: 1,
  },
  label: {
    marginBottom: 20,
  },
  imageStyle: {
    marginTop: getDesignRelativeHeight(30),
    height: getDesignRelativeHeight(76),
    marginBottom: getDesignRelativeHeight(36),
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    minHeight: getDesignRelativeHeight(495),
  },
})

export default withStyles(mapStylesToProps)(GoodMarketDialog)
