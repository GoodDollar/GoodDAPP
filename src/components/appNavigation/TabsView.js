//@flow
import React, { useCallback, useEffect, useState } from 'react'
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

const etoroButtons = (goToRewards, styles) => (
  <>
    <TouchableOpacity testID="rewards_tab" onPress={goToRewards} style={styles.marginLeft10}>
      <Icon name="rewards" size={36} color="white" />
    </TouchableOpacity>
    <Appbar.Content />
    <TouchableOpacity onPress={goToRewards}>
      <Icon name="invite2" size={36} color="white" testID="invite_tab" />
    </TouchableOpacity>
    <Appbar.Content />
  </>
)

const marketButtons = (goToMarketplace, style) => (
  <>
    <TouchableOpacity key="header-button-4" testID="goodmarket_tab" onPress={goToMarketplace} style={style}>
      <Icon name="goodmarket" size={36} color="white" />
    </TouchableOpacity>
    <Appbar.Content />
  </>
)

const supportButton = (goToSupport, space, style) => (
  <>
    <TouchableOpacity onPress={goToSupport} style={style}>
      <Icon name="support2" size={36} color="white" testID="support_tab" />
    </TouchableOpacity>
    {space && <Appbar.Content />}
  </>
)

const TabsView = React.memo(({ navigation, styles }) => {
  const [toggleMenu] = useSidemenu()
  const [token, setToken] = useState(isIOS ? undefined : true)
  const [marketToken, setMarketToken] = useState(isIOS ? undefined : true)

  const fetchTokens = useCallback(async () => {
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
  }, [setToken, setMarketToken])

  useEffect(() => {
    if (config.isEToro) {
      fetchTokens()
    }
  }, [])

  const goToRewards = useCallback(() => {
    if (isIOS) {
      const src = `${config.web3SiteUrl}?token=${token}&purpose=iframe`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Rewards')
    }
  }, [navigation, token])

  const goToSupport = useCallback(() => {
    navigation.navigate('Support')
  }, [navigation])

  const goToMarketplace = useCallback(() => {
    if (isIOS) {
      const src = `${config.marketUrl}?jwt=${marketToken}&nofooter=true`
      window.open(src, '_blank')
    } else {
      navigation.navigate('Marketplace')
    }
  }, [navigation, marketToken])

  return (
    <Appbar.Header dark>
      {config.isEToro && etoroButtons(goToRewards, styles)}
      {!config.isEToro && supportButton(goToSupport, true, styles.marginLeft10)}
      {config.market && marketButtons(goToMarketplace, [styles.marketIconBackground, styles.marginRight5])}
      {config.isEToro && supportButton(goToSupport, true, styles)}
      <TouchableOpacity onPress={toggleMenu}>
        <Icon name="settings" size={20} color="white" style={styles.marginRight10} testID="burger_button" />
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
    borderRadius: '50%',
    paddingVertical: 20,
    paddingHorizontal: 7,
  },
  marginRight5: {
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
