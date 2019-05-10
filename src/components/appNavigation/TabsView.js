//@flow
import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

type TabButtonProps = {
  text?: string,
  routeName: string,
  icon: string,
  goTo: (routeKey: string) => void,
  iconStyle: any,
  tabButtonStyle: any
}

const TabButton = (props: TabButtonProps) => {
  return (
    <View style={[styles.tabButton, props.tabButtonStyle]} onClick={() => props.goTo(props.routeName)}>
      <Image source={props.icon} style={[styles.tabIcon, props.iconStyle]} />
      {props.text && <Text style={styles.tabButtonText}>{props.text}</Text>}
    </View>
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
          text={props.routes[routeKey].displayText !== false && routeKey}
          goTo={props.goTo}
          icon={props.routes[routeKey].icon}
          iconStyle={props.routes[routeKey].iconStyle}
          tabButtonStyle={props.routes[routeKey].buttonStyle}
        />
      ))}
  </View>
)

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
  tabView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '60px',
    backgroundColor: '#909090'
  },
  tabIcon: { width: 40, flexGrow: 2, flexBasis: 0 }
})

export default TabsView
