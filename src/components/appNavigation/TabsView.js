//@flow
import React, { useCallback, useEffect, useState } from 'react'
import { Appbar } from 'react-native-paper'
import { Platform, TouchableOpacity, View } from 'react-native'
import { get } from 'lodash'
import { isIOSWeb } from '../../lib/utils/platform'
import config from '../../config/config'
import { theme } from '../../components/theme/styles'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import Icon from '../../components/common/view/Icon'
import useSideMenu from '../../lib/hooks/useSideMenu'

const { isEToro, market, marketUrl, enableInvites, showRewards } = config

//const showSupportFirst = !isEToro && !showInvite && !showRewards

// const defaultRightButtonStyles = [styles.marginRight10, styles.iconWidth]

// const supportButtonStyles = market ? defaultRightButtonStyles.slice(1) : defaultRightButtonStyless

const log = logger.child({ from: 'TabsView' })

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

const styles = {
  marketIconBackground: {
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
  appBar: { overflow: 'hidden' },
}

const showRewardsFlag = showRewards || isEToro
const showInviteFlag = enableInvites || isEToro
const defaultLeftButtonStyles = [styles.marginLeft10, styles.iconWidth]

// const defaultRightButtonStyles = [styles.marginRight10, styles.iconWidth]
const marketButtonStyles = [styles.marketIconBackground, styles.marginRight10]

// const supportButtonStyles = market ? defaultRightButtonStyles.slice(1) : defaultRightButtonStyles
const inviteButtonStyles = showRewardsFlag ? defaultLeftButtonStyles.slice(1) : defaultLeftButtonStyles

const RewardButton = ({ onPress, style }) => (
  <>
    <TouchableOpacity testID="rewards_tab" onPress={onPress} style={style}>
      <Icon name="rewards" size={36} color="white" />
    </TouchableOpacity>
    <Appbar.Content />
  </>
)

const MarketButton = ({ onPress, style }) => (
  <>
    <TouchableOpacity testID="goodmarket_tab" onPress={onPress} style={style}>
      <Icon name="goodmarket" size={36} color="white" />
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
  const [token, setToken] = useState(isIOSWeb ? undefined : true)
  const [marketToken, setMarketToken] = useState(isIOSWeb ? undefined : true)

  const fetchTokens = useCallback(async () => {
    let _token = await userStorage.getProfileFieldValue('loginToken')

    let _marketToken = await userStorage.getProfileFieldValue('marketToken')

    log.debug('tokens:', { _marketToken, _token })
    if (isIOSWeb) {
      setToken(_token)
      setMarketToken(_marketToken)
    }
  }, [setToken, setMarketToken])

  useEffect(() => {
    fetchTokens()
  }, [])

  const goToRewards = useCallback(
    event => {
      // if (isIOSWeb) {
      //   const src = `${web3SiteUrl}?token=${token}&purpose=iframe`
      //   return window.open(src, '_blank')
      // }
      event.preventDefault()
      navigation.navigate('Rewards')
    },
    [navigation, token],
  )

  /*const goToSupport = useCallback(() => {
    navigation.navigate('Support')
  }, [navigation])*/

  const goToMarketplace = useCallback(() => {
    if (isIOSWeb) {
      const src = `${marketUrl}?jwt=${marketToken}&nofooter=true`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Marketplace')
    }
  }, [navigation, marketToken])

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
      {showInviteFlag && <InviteButton onPress={goToRewards} style={inviteButtonStyles} />}
      {market && (
        <>
          {!isEToro && !!(!enableInvites ^ !showRewards) && <EmptySpaceComponent style={styles.iconWidth} />}
          <MarketButton onPress={goToMarketplace} style={marketButtonStyles} />
        </>
      )}
      {/*{!showSupportFirst && <SupportButton onPress={goToSupport} style={supportButtonStyles} />}*/}
      {!market && !showInviteFlag && !showRewardsFlag && <EmptySpaceComponent style={styles.iconWidth} />}
      <TouchableOpacity onPress={slideToggle} style={styles.iconWidth}>
        <Icon name="settings" size={20} color="white" style={styles.marginRight10} testID="burger_button" />
      </TouchableOpacity>
    </Appbar.Header>
  )
}

export default TabsView
