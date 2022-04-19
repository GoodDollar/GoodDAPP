import React, { useMemo } from 'react'

import { t } from '@lingui/macro'
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
      title={t`Check out GoodMarket`}
      text={
        t`Visit GoodMarket, our exclusive marketplace,` +
        `\n` +
        t`where you can buy and sell items ` +
        `\n` +
        t`in exchange for G$ coins.`
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
          text: t`LET'S GO`,
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
    fontWeight: '500',
    fontFamily: theme.fonts.default,
    alignSelf: 'baseline',
    textAlignVertical: 'bottom',
    width: '100%',
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
  container: {
    justifyContent: 'flex-start',
    minHeight: getDesignRelativeHeight(495),
  },
})

export default withStyles(mapStylesToProps)(GoodMarketDialog)
