//@flow
import React from 'react'
import { Appbar } from 'react-native-paper'
import { TouchableOpacity } from 'react-native-web'
import { toggleSidemenu } from '../../lib/undux/utils/sidemenu'
import SimpleStore from '../../lib/undux/SimpleStore'
import userStorage from '../../lib/gundb/UserStorage'
import RewardSvg from '../../components/common/view/RewardSvg'

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
  const { navigation } = props
  const store = SimpleStore.useStore()
  const goToRewards = () => {
    userStorage.getProfileFieldValue('loginToken').then(loginToken => {
      navigation.navigate('Rewards', { loginToken })
    })
  }

  return (
    <Appbar.Header dark>
      <TouchableOpacity onPress={goToRewards} style={{ marginLeft: '10px' }}>
        <RewardSvg />
      </TouchableOpacity>
      <Appbar.Content />
      <Appbar.Action icon="menu" onPress={toggleSidemenu.bind(null, store)} color="white" />
    </Appbar.Header>
  )
}

export default TabsView
