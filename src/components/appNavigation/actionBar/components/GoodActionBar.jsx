import React from 'react'
import { View } from 'react-native'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { withStyles } from '../../../../lib/styles'
import { isIOSNative } from '../../../../lib/utils/platform'

import RewardButton from './RewardButton'
import ActionButton from './ActionButton'

const GoodActionBar = ({ styles, navigation }) => {
  const goToRewards = useOnPress(() => navigation.navigate('Rewards'), [navigation])

  return (
    <>
      <View style={styles.actionBar}>
        <RewardButton onPress={goToRewards} style={styles.actionItem} />
        <ActionButton action="donate" />
        <ActionButton action="learn" />
        <ActionButton action="gooddapp" />
        <ActionButton action="vote" />
      </View>
    </>
  )
}

const getStylesFromProps = ({ theme }) => ({
  actionBar: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: theme.sizes.default,
    paddingBottom: isIOSNative ? theme.sizes.defaultDouble : theme.sizes.default,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  actionItem: {
    marginLeft: 10,
    marginRight: 10,
  },
})

export default withStyles(getStylesFromProps)(GoodActionBar)
