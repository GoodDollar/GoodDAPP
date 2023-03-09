//@flow
import React, { useEffect, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'

import { Icon, Text } from '../../components/common'

import useOnPress from '../../lib/hooks/useOnPress'
import useSideMenu from '../../lib/hooks/useSideMenu'
import { isMobileNative } from '../../lib/utils/platform'
import { useSwitchNetwork, useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import { useInvited } from '../invite/useInvites'
import { theme } from '../theme/styles'

// const showSupportFirst = !isEToro && !showInvite && !showRewards
// const defaultRightButtonStyles = [styles.marginRight10, styles.iconWidth]
// const supportButtonStyles = market ? defaultRightButtonStyles.slice(1) : defaultRightButtonStyless

const styles = {
  /*marketIconBackground: {
    backgroundColor: theme.colors.green,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
    borderRadius: Platform.select({
      default: 150 / 2,
      web: '50%',
    }),
    paddingVertical: Platform.select({
      web: 20,
      default: 7,
    }),
    paddingHorizontal: 7,
    width: 80,
    height: 80,
    justifyContent: 'center',
  },*/
  marginLeft10: {
    marginLeft: 10,
  },
  marginRight10: {
    marginRight: 10,
  },
  iconWidth: {
    width: 37,
  },
  iconView: {
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  iconViewLeft: {
    alignItems: 'flex-start',
  },
  iconViewRight: {
    alignItems: 'flex-end',
  },
  appBar: { overflow: 'hidden', display: 'flex', justifyContent: 'space-between' },
  networkName: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}

const iconStyle = isMobileNative ? styles.iconView : styles.iconWidth

const defaultLeftButtonStyles = [styles.marginLeft10, iconStyle, styles.iconViewLeft]
const defaultRightButtonStyles = [iconStyle, styles.iconViewRight]

const RewardButton = React.memo(({ onPress, style }) => {
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
        <Icon name="rewards" size={36} color="white" />
        {updatesCount > 0 && (
          <View style={rewardStyles.notifications}>
            <Text color={theme.colors.white} fontSize={10} fontWeight={'bold'}>
              {updatesCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  )
})

const rewardStyles = {
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
}

const NetworkName = () => {
  const { currentNetwork } = useSwitchNetwork()

  return (
    <View style={styles.networkName}>
      <Text color={'white'} fontWeight="bold">
        {currentNetwork}
      </Text>
    </View>
  )
}
const TabsView = React.memo(
  ({ navigation }) => {
    const { slideToggle } = useSideMenu()
    const goToRewards = useOnPress(() => navigation.navigate('Rewards'), [navigation])

    const _slideToggle = useOnPress(slideToggle)

    return (
      <Appbar.Header dark style={styles.appBar}>
        <RewardButton onPress={goToRewards} style={defaultLeftButtonStyles} />
        <NetworkName />
        <TouchableOpacity onPress={_slideToggle} style={defaultRightButtonStyles}>
          <Icon name="settings" size={20} color="white" style={styles.marginRight10} testID="burger_button" />
        </TouchableOpacity>
      </Appbar.Header>
    )
  },
  () => true,
)

export default TabsView
