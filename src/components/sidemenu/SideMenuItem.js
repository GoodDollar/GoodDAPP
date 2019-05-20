// @flow
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon, normalize } from 'react-native-elements'

export type SideMenuItemProps = {
  icon: string,
  name: string,
  action: Function
}

const SideMenuItem = ({ icon, name, action }: SideMenuItemProps) => (
  <TouchableOpacity style={styles.clickableRow} onPress={action}>
    <View style={styles.menuIcon}>
      <Icon name={icon} size={20} />
    </View>
    <Text style={styles.menuItem}>{name}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: normalize(20),
    cursor: 'pointer'
  },
  menuItem: {
    fontWeight: 'bold',
    fontSize: normalize(15)
  },
  menuIcon: {
    marginHorizontal: normalize(20)
  }
})

export default SideMenuItem
