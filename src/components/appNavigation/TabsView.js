//@flow
import React, { useEffect, useState } from 'react'
import { Appbar } from 'react-native-paper'
import { Platform, TouchableOpacity } from 'react-native'
import { get } from 'lodash'
import { isIOSWeb } from '../../lib/utils/platform'
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
  const [token, setToken] = useState(isIOSWeb ? undefined : true)
  const [marketToken, setMarketToken] = useState(isIOSWeb ? undefined : true)

  const fetchTokens = async () => {
    let _token = await userStorage.getProfileFieldValue('loginToken')

    if (!_token) {
      _token = await API.getLoginToken()
        .then(r => get(r, 'data.loginToken'))
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
        .then(_ => get(_, 'data.jwt'))
        .then(newtoken => {
          if (newtoken) {
            userStorage.setProfileField('marketToken', newtoken)
          }

          return newtoken
        })
    }
    log.debug('tokens:', { _marketToken, _token })
    if (isIOSWeb) {
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
    if (isIOSWeb) {
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
    if (isIOSWeb) {
      const src = `${config.marketUrl}?jwt=${marketToken}&nofooter=true`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Marketplace')
    }
  }

  return (
    <Appbar.Header dark style={styles.appBar}>
      {config.isEToro && (
        <TouchableOpacity testID="rewards_tab" onPress={goToRewards} style={styles.rewardsStyle}>
          <Icon name="rewards" size={36} color="white" />
        </TouchableOpacity>
      )}
      <Appbar.Content />
      <TouchableOpacity onPress={goToRewards}>
        <Icon name="invite2" size={36} color="white" testID="invite_tab" />
      </TouchableOpacity>
      <Appbar.Content />
      {config.market && (
        <TouchableOpacity testID="goodmarket_tab" onPress={goToMarketplace} style={styles.marketIconBackground}>
          <Icon name="goodmarket" size={36} color="white" />
        </TouchableOpacity>
      )}
      <Appbar.Content />
      <TouchableOpacity onPress={goToSupport} style={styles.feedback}>
        <Icon name="support2" size={36} color="white" testID="support_tab" />
      </TouchableOpacity>
      <Appbar.Content />
      <TouchableOpacity onPress={toggleMenu}>
        <Icon name="settings" size={20} color="white" style={styles.menuStyle} testID="burger_button" />
      </TouchableOpacity>
    </Appbar.Header>
  )
})

const styles = ({ theme }) => ({
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
  feedback: {
    marginRight: 5,
  },
  rewardsStyle: {
    marginLeft: 10,
  },
  menuStyle: {
    marginRight: 10,
  },
  appBar: { overflow: 'hidden' },
})

export default withStyles(styles)(TabsView)
