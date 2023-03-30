import React, { useCallback } from 'react'
import { View } from 'react-native'
import RewardButton from '../../../common/buttons/RewardButton'
import useActionLinks from '../hooks/useActionLinks'
import useOnPress from '../../../../lib/hooks/useOnPress'
import { withStyles } from '../../../../lib/styles'
import { isIOSNative } from '../../../../lib/utils/platform'
import { ActionButton } from '../../../common/'

const GoodActionBar = ({ styles, navigation }) => {
  const { goToExternal, trackClicked } = useActionLinks()
  const goToRewards = useOnPress(() => navigation.navigate('Rewards'), [navigation])

  const onButtonClicked = useCallback(
    src => {
      goToExternal(src)
      return
    },
    [trackClicked],
  )

  return (
    <>
      <View style={styles.actionBar}>
        <ActionButton src="learn" onPress={onButtonClicked} />
        <ActionButton src="usegd" onPress={onButtonClicked} />
        <ActionButton src="donate" onPress={onButtonClicked} />
        <RewardButton onPress={goToRewards} style={styles.actionItem} />
        <ActionButton src="vote" onPress={onButtonClicked} />
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
    borderTopRightRadius: 22,
    borderTopLeftRadius: 22,
  },
  actionItem: {
    marginLeft: 10,
    marginRight: 10,
  },
})

export default withStyles(getStylesFromProps)(GoodActionBar)
