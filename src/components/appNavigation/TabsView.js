//@flow
import React from 'react'
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
import Icon from '../../components/common/view/Icon'

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

const TabsView = (props: TabViewProps) => {
  const { navigation, styles } = props
  const store = SimpleStore.useStore()

  const goToRewards = async () => {
    if (isMobileSafari) {
      let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
      const src = `${config.web3SiteUrl}?token=${token}&purpose=iframe`
      window.open(src, '_self')
    } else {
      navigation.navigate('Rewards')
    }
  }

  const goToMarketplace = async () => {
    if (isMobileSafari) {
      let token = await userStorage.getProfileFieldValue('marketToken')
      const src = `${config.marketUrl}?jwt=${token}&nofooter=true`
      window.open(src, '_self')
      const newtoken = await API.getMarketToken().then(_ => _get(_, 'data.jwt'))
      if (newtoken !== undefined && newtoken !== token) {
        token = newtoken
        userStorage.setProfileField('marketToken', newtoken)
      }
    } else {
      navigation.navigate('Marketplace')
    }
  }

  return (
    <Appbar.Header dark>
      <TouchableOpacity onPress={goToRewards} style={{ marginLeft: '10px', display: 'flex' }}>
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
}

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
