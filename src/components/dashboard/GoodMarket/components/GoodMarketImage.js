import React from 'react'
import { Image, Platform, View } from 'react-native'

import Icon from '../../../common/view/Icon'

import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeWidth } from '../../../../lib/utils/sizes'

import arrowRight from '../../../../assets/arrowRight.svg'

if (Platform.OS === 'web') {
  Image.prefetch(arrowRight)
}

const GoodMarketImage = ({ style, styles }) => (
  <View style={[style, styles.wrapper]}>
    <Image style={styles.arrow} source={arrowRight} />
    <Icon name="goodmarket" size={122} style={styles.marketIcon} />
  </View>
)

const mapStylesToProps = ({ theme }) => ({
  arrow: {
    width: '100%',
    maxWidth: getDesignRelativeWidth(65, false),
  },
  marketIcon: {
    marginLeft: -getDesignRelativeWidth(40, false),
    color: theme.colors.primary,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    flex: 1,
    justifyContent: 'center',
  },
})

export default withStyles(mapStylesToProps)(GoodMarketImage)
