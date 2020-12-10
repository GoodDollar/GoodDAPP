//@flow
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'

import config from '../../config/config'

import { Icon, Text } from '../../components/common'

import useOnPress from '../../lib/hooks/useOnPress'
import useSideMenu from '../../lib/hooks/useSideMenu'
import { isMobileNative } from '../../lib/utils/platform'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { useInvited } from '../invite/useInvites'
import { theme } from '../theme/styles'
const { isEToro, enableInvites, showRewards } = config

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
  appBar: { overflow: 'hidden' },
}

const showRewardsFlag = showRewards || isEToro
const showInviteFlag = enableInvites || isEToro
const iconStyle = isMobileNative ? styles.iconView : styles.iconWidth

const defaultLeftButtonStyles = [styles.marginLeft10, iconStyle, styles.iconViewLeft]
const defaultRightButtonStyles = [iconStyle, styles.iconViewRight]

// const supportButtonStyles = market ? defaultRightButtonStyles.slice(1) : defaultRightButtonStyles
const inviteButtonStyles = showRewardsFlag ? defaultLeftButtonStyles.slice(1) : defaultLeftButtonStyles

// const log = logger.child({ from: 'TabsView' })

// TODO: Decide if makes sense keep this to add tab behavior again
// type TabButtonProps = {
//   text?: string,
//   routeName: string,
//   icon: string,
//   goTo: (routeKey: string) => void
// }

// const TabButton = (props: TabButtonProps) => {
//   return (
//     <TouchableOpacity style={styles.tabButton} onPress={() => props.goTo(props.routeName)}>
//       <Image source={props.icon} style={styles.tabIcon} />
//       <Text style={styles.tabButtonText}>{props.text || ''}</Text>
//     </TouchableOpacity>
//   )
// }
//
// const TabsView = (props: TabViewProps) => (
//   <View style={styles.tabView}>
//     {Object.keys(props.routes)
//       .filter(routeKey => props.routes[routeKey].display !== false)
//       .map(routeKey => (
//         <TabButton
//           key={routeKey}
//           routeName={routeKey}
//           text={routeKey}
//           goTo={props.goTo}
//           icon={props.routes[routeKey].icon}
//         />
//       ))}
//     <TabSideMenu />
//   </View>
// )

const RewardButton = React.memo(({ onPress, style }) => {
  const [, , , inviteState] = useInvited()
  const [updatesCount, setUpdatesCount] = useState(0)

  const updateIcon = async () => {
    const lastState = (await AsyncStorage.getItem('GD_lastInviteState')) || { pending: 0, approved: 0 }
    const newPending = Math.max(inviteState.pending - lastState.pending, 0)
    const newApproved = Math.max(inviteState.approved - lastState.approved, 0)
    setUpdatesCount(newPending + newApproved)
  }
  useEffect(() => {
    updateIcon()
  }, [inviteState])

  return (
    <>
      <TouchableOpacity testID="rewards_tab" onPress={onPress} style={style}>
        <Icon name="rewards" size={36} color="white">
          {updatesCount > 0 && (
            <View style={rewardStyles.notifications}>
              <Text color={theme.colors.white} fontSize={10} fontWeight={'bold'}>
                {updatesCount}
              </Text>
            </View>
          )}
        </Icon>
      </TouchableOpacity>
      <Appbar.Content />
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
    top: '-10%',
    left: '70%',
  },
}

// const InviteButton = ({ onPress, style }) => (
//   <>
//     <TouchableOpacity onPress={onPress} style={style}>
//       <Icon name="invite2" size={36} color="white" testID="invite_tab" />
//     </TouchableOpacity>
//     <Appbar.Content />
//   </>
// )

/*const SupportButton = ({ onPress, style }) => (
  <>
    <TouchableOpacity onPress={onPress} style={style}>
      <Icon name="support2" size={36} color="white" testID="support_tab" />
    </TouchableOpacity>
    <Appbar.Content />
  </>
)*/

const EmptySpaceComponent = ({ style }) => (
  <>
    <View style={style} />
    <Appbar.Content />
  </>
)

const TabsView = React.memo(
  ({ navigation }) => {
    const { slideToggle } = useSideMenu()

    // eslint-disable-next-line no-unused-vars
    /*const [token, setToken] = useState(isIOSWeb ? undefined : true)

  // const fetchTokens = useCallback(async () => {
  //   let _token = await userStorage.getProfileFieldValue('loginToken')

  //   log.debug('tokens:', { _token })

  //   if (isIOS) {
  //     setToken(_token)
  //   }
  // }, [setToken])

  useEffect(() => {
    fetchTokens()
  }, [])*/

    const goToRewards = useOnPress(() => navigation.navigate('Rewards'), [navigation])

    /*const goToSupport = useCallback(() => {
    navigation.navigate('Support')
  }, [navigation])*/

    const _slideToggle = useOnPress(slideToggle)

    return (
      <Appbar.Header dark style={styles.appBar}>
        {/*{showSupportFirst ? (
        <SupportButton onPress={goToSupport} style={defaultLeftButtonStyles} />
      ) : (
        <>
          {showRewardsFlag && <RewardButton onPress={goToRewards} style={defaultLeftButtonStyles} />}
          {showInviteFlag && <InviteButton onPress={goToRewards} style={inviteButtonStyles} />}
        </>
      )}*/}
        {showRewardsFlag && <RewardButton onPress={goToRewards} style={defaultLeftButtonStyles} />}
        {showInviteFlag && <RewardButton onPress={goToRewards} style={inviteButtonStyles} />}
        {/*{!showSupportFirst && <SupportButton onPress={goToSupport} style={supportButtonStyles} />}*/}
        {/*!market && */ !showInviteFlag && !showRewardsFlag && <EmptySpaceComponent style={styles.iconWidth} />}
        <TouchableOpacity onPress={_slideToggle} style={defaultRightButtonStyles}>
          <Icon name="settings" size={20} color="white" style={styles.marginRight10} testID="burger_button" />
        </TouchableOpacity>
      </Appbar.Header>
    )
  },
  () => true,
)

export default TabsView
