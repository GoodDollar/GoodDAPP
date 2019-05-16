//@flow
import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { normalize } from 'react-native-elements'
import burgerIcon from '../../assets/burgerIcon.png'
import { toggleSidemenu } from '../../lib/undux/utils/sidemenu'
import GDStore from '../../lib/undux/GDStore'

type TabButtonProps = {
  text?: string,
  routeName: string,
  icon: string,
  goTo: (routeKey: string) => void
}

const TabButton = (props: TabButtonProps) => {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={() => props.goTo(props.routeName)}>
      <Image source={props.icon} style={styles.tabIcon} />
      {props.text && <Text style={styles.tabButtonText}>{props.text}</Text>}
    </TouchableOpacity>
  )
}

type TabViewProps = {
  routes: { [string]: any },
  goTo: (routeKey: string) => void
}

const TabsView = (props: TabViewProps) => (
  <View style={styles.tabView}>
    {Object.keys(props.routes)
      .filter(routeKey => props.routes[routeKey].display !== false)
      .map(routeKey => (
        <TabButton
          key={routeKey}
          routeName={routeKey}
          text={routeKey}
          goTo={props.goTo}
          icon={props.routes[routeKey].icon}
        />
      ))}
    <TabSideMenu />
  </View>
)

const TabSideMenu = () => {
  const store = GDStore.useStore()
  return (
    <View style={[styles.tabButton, styles.burgerIconButton]} onClick={() => toggleSidemenu(store)}>
      <Image source={burgerIcon} style={styles.burgerIcon} />
    </View>
  )
}

const styles = StyleSheet.create({
  tabButtonText: {
    color: '#d2d2d2',
    textAlign: 'center'
  },
  tabButton: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer'
  },
  burgerIconButton: {
    marginLeft: 'auto',
    marginRight: normalize(30)
  },
  tabView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '60px',
    backgroundColor: '#909090'
  },
  tabIcon: {
    width: normalize(40),
    flexGrow: 2,
    flexBasis: 0
  },
  burgerIcon: {
    width: normalize(20),
    maxHeight: normalize(20),
    marginTop: normalize(20),
    flexGrow: 2,
    flexBasis: 0
  }
})

export default TabsView
