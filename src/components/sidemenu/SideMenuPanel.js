// @flow
import React from 'react'
import SideMenuItem from './SideMenuItem'
import { View, StyleSheet } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import { useWrappedApi } from '../../lib/API/useWrappedApi'

type SideMenuPanelProps = {
  navigation: any,
  getItems: Function
}

const SideMenuPanel = ({ navigation, getItems }: SideMenuPanelProps) => {
  const API = useWrappedApi()
  const sidemenuActions = useSidemenu()
  const { toggleSidemenu } = sidemenuActions

  const MENU_ITEMS = getItems({ API, sidemenuActions, navigation })
  return (
    <View>
      <View style={styles.closeIconRow} onClick={toggleSidemenu}>
        <Icon name="close" />
      </View>
      {MENU_ITEMS.map(item => (
        <SideMenuItem key={item.name} {...item} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  closeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: normalize(20),
    marginLeft: 'auto',
    marginRight: normalize(20),
    cursor: 'pointer'
  }
})

export default SideMenuPanel
