import React from 'react'
import { Image, Platform, View } from 'react-native'

import Icon from '../../../common/view/Icon'

import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

import arrowRight from '../../../../assets/arrowRight.svg'

if (Platform.OS === 'web') {
  Image.prefetch(arrowRight)
}

const GoodMarketImage = ({ style, styles }) => (
  <View style={[style, styles.wrapper]}>
    <Image style={styles.arrow} source={arrowRight} />
    <Icon name="goodmarket" size={96} style={styles.marketIcon} />
  </View>
)

const mapStylesToProps = ({ theme }) => ({
  arrow: {
    height: getDesignRelativeHeight(74, false),
    width: getDesignRelativeWidth(82, false),
  },
  marketIcon: {
    marginLeft: -getDesignRelativeWidth(40, false),
    color: theme.colors.primary,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    overflowY: 'hidden',
  },
})

export default withStyles(mapStylesToProps)(GoodMarketImage)
