//@flow
import React, { useEffect, useState } from 'react'
import { Appbar } from 'react-native-paper'
import { isIOS } from 'mobile-device-detect'
import { TouchableOpacity } from 'react-native-web'
import _get from 'lodash/get'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import config from '../../config/config'
import { withStyles } from '../../lib/styles'
import userStorage from '../../lib/gundb/UserStorage'
import API from '../../lib/API/api'
import logger from '../../lib/logger/pino-logger'
import Icon from '../../components/common/view/Icon'

const log = logger.child({ from: 'TabsView' })
type TabViewProps = {
  routes: { [string]: any },
  goTo: (routeKey: string) => void,
}

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

const TabsView = React.memo((props: TabViewProps) => {
  const { navigation, styles } = props
  const [toggleMenu] = useSidemenu()
  const [token, setToken] = useState(isIOS ? undefined : true)
  const [marketToken, setMarketToken] = useState(isIOS ? undefined : true)

  const fetchTokens = async () => {
    let _token = await userStorage.getProfileFieldValue('loginToken')

    if (!_token) {
      _token = await API.getLoginToken()
        .then(r => _get(r, 'data.loginToken'))
        .then(newToken => {
          if (newToken) {
            userStorage.setProfileField('loginToken', newToken, 'private')
          }

          return newToken
        })
    }

    let _marketToken = await userStorage.getProfileFieldValue('marketToken')

    if (!_marketToken) {
      _marketToken = await API.getMarketToken()
        .then(_ => _get(_, 'data.jwt'))
        .then(newtoken => {
          if (newtoken) {
            userStorage.setProfileField('marketToken', newtoken)
          }

          return newtoken
        })
    }
    log.debug('tokens:', { _marketToken, _token })
    if (isIOS) {
      setToken(_token)
      setMarketToken(_marketToken)
    }
  }

  useEffect(() => {
    if (config.isEToro) {
      fetchTokens()
    }
  }, [])

  const goToRewards = () => {
    if (isIOS) {
      const src = `${config.web3SiteUrl}?token=${token}&purpose=iframe`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Rewards')
    }
  }
  const goToSupport = () => {
    navigation.navigate('Support')
  }
  const goToMarketplace = () => {
    if (isIOS) {
      const src = `${config.marketUrl}?jwt=${marketToken}&nofooter=true`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Marketplace')
    }
  }

  // default header buttons
  const headerButtons = [
    <Appbar.Content key="header-button-0" />,
    <TouchableOpacity onPress={toggleMenu} key="header-button-1">
      <Icon name="settings" size={20} color="white" style={styles.marginRight10} testID="burger_button" />
    </TouchableOpacity>,
  ]

  if (!config.isEToro && !config.market) {
    // etoro and market is off
    headerButtons.unshift(
      <TouchableOpacity key="header-button-2" onPress={goToSupport} style={styles.marginLeft10}>
        <Icon name="support2" size={36} color="white" testID="support_tab" />
      </TouchableOpacity>
    )
  } else if (!config.isEToro && config.market) {
    // only market is on
    headerButtons.unshift(
      <TouchableOpacity key="header-button-2" onPress={goToSupport} style={styles.marginLeft10}>
        <Icon name="support2" size={36} color="white" testID="support_tab" />
      </TouchableOpacity>,
      <Appbar.Content key="header-button-3" />,
      <TouchableOpacity
        key="header-button-4"
        testID="goodmarket_tab"
        onPress={goToMarketplace}
        style={[styles.marketIconBackground, styles.marginRight10]}
      >
        <Icon name="goodmarket" size={36} color="white" />
      </TouchableOpacity>
    )
  } else if (config.isEToro && !config.market) {
    // only etoro is on
    headerButtons.unshift(
      <TouchableOpacity key="header-button-2" testID="rewards_tab" onPress={goToRewards} style={styles.marginLeft10}>
        <Icon name="rewards" size={36} color="white" />
      </TouchableOpacity>,
      <Appbar.Content key="header-button-3" />,
      <TouchableOpacity onPress={goToRewards}>
        <Icon name="invite2" size={36} color="white" testID="invite_tab" />
      </TouchableOpacity>,
      <Appbar.Content key="header-button-4" />,
      <TouchableOpacity key="header-button-5" onPress={goToSupport} style={styles.feedback}>
        <Icon name="support2" size={36} color="white" testID="support_tab" />
      </TouchableOpacity>
    )
  } else {
    // etoro and market is on
    headerButtons.unshift(
      <TouchableOpacity key="header-button-2" testID="rewards_tab" onPress={goToRewards} style={styles.marginLeft10}>
        <Icon name="rewards" size={36} color="white" />
      </TouchableOpacity>,
      <Appbar.Content key="header-button-3" />,
      <TouchableOpacity onPress={goToRewards}>
        <Icon name="invite2" size={36} color="white" testID="invite_tab" />
      </TouchableOpacity>,
      <Appbar.Content key="header-button-4" />,
      <TouchableOpacity
        key="header-button-5"
        testID="goodmarket_tab"
        onPress={goToMarketplace}
        style={styles.marketIconBackground}
      >
        <Icon name="goodmarket" size={36} color="white" />
      </TouchableOpacity>,
      <Appbar.Content key="header-button-6" />,
      <TouchableOpacity key="header-button-6" onPress={goToSupport} style={styles.feedback}>
        <Icon name="support2" size={36} color="white" testID="support_tab" />
      </TouchableOpacity>
    )
  }

  return <Appbar.Header dark>{headerButtons}</Appbar.Header>
})

const styles = ({ theme }) => ({
  marketIconBackground: {
    backgroundColor: theme.colors.green,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
    borderRadius: '50%',
    paddingVertical: 20,
    paddingHorizontal: 7,
  },
  feedback: {
    marginRight: 5,
  },
  marginLeft10: {
    marginLeft: 10,
  },
  marginRight10: {
    marginRight: 10,
  },
})

export default withStyles(styles)(TabsView)
