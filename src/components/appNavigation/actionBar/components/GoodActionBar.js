import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import useOnPress from '../../../../lib/hooks/useOnPress'
import { withStyles } from '../../../../lib/styles'
import { isIOSNative } from '../../../../lib/utils/platform'
import { openLink } from '../../../../lib/utils/linking'
import Config from '../../../../config/config'
import GoodDappIcon from '../../../../assets/gooddapp.svg'
import RewardButton from './RewardButton'
import ActionButton from './ActionButton'

const goodDappStyles = {
  button: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '20%',
  },
}

const GoodDappButton = ({ onPress, styles }) => (
  <TouchableOpacity onPress={onPress} style={goodDappStyles.button}>
    <GoodDappIcon width="80" height="50" />
  </TouchableOpacity>
)

const GoodActionBar = ({ styles, navigation }) => {
  const goToRewards = useOnPress(() => navigation.navigate('Rewards'), [navigation])
  const goToGoodDapp = useOnPress(() => openLink(Config.goodSwapUrl), [])

  return (
    <>
      <View style={styles.actionBar}>
        <RewardButton onPress={goToRewards} style={styles.actionItem} />
        <ActionButton action="donate" />
        <GoodDappButton onPress={goToGoodDapp} />
        <ActionButton action="learn" />
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
