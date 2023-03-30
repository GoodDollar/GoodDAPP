import React, { useEffect, useState } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'
import { withStyles } from '../../../lib/styles'
import { useInvited } from '../../invite/useInvites'
import Icon from '../../common/view/Icon'
import { theme } from '../../theme/styles'

const getStylesFromProps = ({ theme }) => ({
  notifications: {
    width: 13.3,
    height: 13.3,
    backgroundColor: theme.colors.orange,
    borderRadius: 7,
    position: 'absolute',
    top: Platform.select({
      web: '-10%',
      default: '5%',
    }),
    left: Platform.select({
      web: '70%',
      default: '55%',
    }),
  },
})

const RewardButton = React.memo(({ onPress, style, props }) => {
  const [, , , inviteState] = useInvited()
  const [updatesCount, setUpdatesCount] = useState(0)
  const userStorage = useUserStorage()

  useEffect(() => {
    const lastState = userStorage.userProperties.get('lastInviteState') || { pending: 0, approved: 0, total: 0 }

    const newPending = Math.max(inviteState.pending - lastState.pending, 0)
    const newApproved = Math.max(inviteState.approved - lastState.approved, 0)
    setUpdatesCount(newPending + newApproved)
  }, [inviteState])

  return (
    <>
      <TouchableOpacity testID="rewards_tab" onPress={onPress} style={style}>
        <Icon name="rewards-alt" size={48} color="white" />
        {updatesCount > 0 && (
          <View style={props.notifications}>
            <Text color={theme.colors.white} fontSize={10} fontWeight={'bold'}>
              {updatesCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  )
})

export default withStyles(getStylesFromProps)(RewardButton)
