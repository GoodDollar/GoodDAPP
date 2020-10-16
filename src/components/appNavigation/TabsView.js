//@flow
import React, { useCallback } from 'react'
import { Appbar } from 'react-native-paper'
import { TouchableOpacity, View } from 'react-native'
import config from '../../config/config'
import { theme } from '../../components/theme/styles'

import Icon from '../../components/common/view/Icon'
import useSideMenu from '../../lib/hooks/useSideMenu'

const { isEToro, enableInvites, showRewards } = config

const styles = {
  marketIconBackground: {
    backgroundColor: theme.colors.green,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
    borderRadius: '50%',
    paddingVertical: 20,
    paddingHorizontal: 7,
  },
  marginLeft10: {
    marginLeft: 10,
  },
  marginRight10: {
    marginRight: 10,
  },
  iconWidth: {
    width: 37,
  },
}

//const showSupportFirst = !isEToro && !showInvite && !showRewards
const showRewardsFlag = showRewards || isEToro
const showInviteFlag = enableInvites || isEToro
const defaultLeftButtonStyles = [styles.marginLeft10, styles.iconWidth]

// const defaultRightButtonStyles = [styles.marginRight10, styles.iconWidth]

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

const RewardButton = ({ onPress, style }) => (
  <>
    <TouchableOpacity testID="rewards_tab" onPress={onPress} style={style}>
      <Icon name="rewards" size={36} color="white" />
    </TouchableOpacity>
    <Appbar.Content />
  </>
)

const InviteButton = ({ onPress, style }) => (
  <>
    <TouchableOpacity onPress={onPress} style={style}>
      <Icon name="invite2" size={36} color="white" testID="invite_tab" />
    </TouchableOpacity>
    <Appbar.Content />
  </>
)

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

const TabsView = ({ navigation }) => {
  const { slideToggle } = useSideMenu()

  // const [token, setToken] = useState(isIOS ? undefined : true)

  // const fetchTokens = useCallback(async () => {
  //   let _token = await userStorage.getProfileFieldValue('loginToken')

  //   log.debug('tokens:', { _token })

  //   if (isIOS) {
  //     setToken(_token)
  //   }
  // }, [setToken])

  // useEffect(() => {
  //   fetchTokens()
  // }, [])

  const goToRewards = useCallback(
    event => {
      event.preventDefault()
      navigation.navigate('Rewards')
    },
    [navigation],
  )

  /*const goToSupport = useCallback(() => {
    navigation.navigate('Support')
  }, [navigation])*/

  return (
    <Appbar.Header dark>
      {/*{showSupportFirst ? (
        <SupportButton onPress={goToSupport} style={defaultLeftButtonStyles} />
      ) : (
        <>
          {showRewardsFlag && <RewardButton onPress={goToRewards} style={defaultLeftButtonStyles} />}
          {showInviteFlag && <InviteButton onPress={goToRewards} style={inviteButtonStyles} />}
        </>
      )}*/}
      {showRewardsFlag && <RewardButton onPress={goToRewards} style={defaultLeftButtonStyles} />}
      {showInviteFlag && <InviteButton onPress={goToRewards} style={inviteButtonStyles} />}
      {/*{!showSupportFirst && <SupportButton onPress={goToSupport} style={supportButtonStyles} />}*/}
      {/*!market && */ !showInviteFlag && !showRewardsFlag && <EmptySpaceComponent style={styles.iconWidth} />}
      <TouchableOpacity onPress={slideToggle} style={styles.iconWidth}>
        <Icon name="settings" size={20} color="white" style={styles.marginRight10} testID="burger_button" />
      </TouchableOpacity>
    </Appbar.Header>
  )
}

export default TabsView
