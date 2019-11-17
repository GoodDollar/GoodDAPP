//@flow
/* eslint-disable */
import React, { useEffect, useState } from 'react'
import { Appbar } from 'react-native-paper'
import { isMobileSafari } from 'mobile-device-detect'
import { TouchableOpacity } from 'react-native-web'
import _get from 'lodash/get'
import { toggleSidemenu } from '../../lib/undux/utils/sidemenu'
import SimpleStore from '../../lib/undux/SimpleStore'
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
  const store = SimpleStore.useStore()
  const [token, setToken] = useState(isMobileSafari ? undefined : true)
  const [marketToken, setMarketToken] = useState(isMobileSafari ? undefined : true)

  const fetchTokens = async () => {
    let _token = await userStorage.getProfileFieldValue('loginToken')

    if (!_token) {
      _token = await API.getLoginToken()
        .then(r => _get(r, 'data.loginToken'))
        .then(newToken => {
          userStorage.setProfileField('loginToken', newToken, 'private')

          return newToken
        })
    }

    let _marketToken = await userStorage.getProfileFieldValue('marketToken')

    if (!_marketToken) {
      _marketToken = await API.getMarketToken()
        .then(_ => _get(_, 'data.jwt'))
        .then(newtoken => {
          userStorage.setProfileField('marketToken', newtoken)

          return newtoken
        })
    }
    log.debug('tokens:', { _marketToken, _token })
    if (isMobileSafari) {
      setToken(_token)
      setMarketToken(_marketToken)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  const goToRewards = () => {
    if (isMobileSafari) {
      const src = `${config.web3SiteUrl}?token=${token}&purpose=iframe`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Rewards')
    }
  }

  const goToMarketplace = () => {
    if (isMobileSafari) {
      const src = `${config.marketUrl}?jwt=${marketToken}&nofooter=true`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Marketplace')
    }
  }

  return (
    <Appbar.Header dark>
      <TouchableOpacity onPress={goToRewards} style={{ marginLeft: '10px' }}>
        <Icon name="rewards" size={36} color="white" />
      </TouchableOpacity>
      <Appbar.Content />
      {config.market && (
        <TouchableOpacity onPress={goToMarketplace} style={styles.marketIconBackground}>
          <Icon name="goodmarket" size={36} color="white" />
        </TouchableOpacity>
      )}
      <Appbar.Content />
      <Appbar.Action icon="menu" onPress={toggleSidemenu.bind(null, store)} color="white" />
    </Appbar.Header>
  )
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
})

export default withStyles(styles)(TabsView)
