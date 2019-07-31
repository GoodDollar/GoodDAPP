// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'

export type SideMenuItemProps = {
  icon: string,
  name: string,
  action: Function,
}

const SideMenuItem = ({ icon, name, action, styles, theme }: SideMenuItemProps) => (
  <TouchableOpacity style={styles.clickableRow} onPress={action}>
    <View style={styles.menuIcon}>
      <Icon name={icon} size={24} color={theme.colors.primary} />
    </View>
    <Text color="darkGray" fontFamily="medium" textAlign="left">
      {name}
    </Text>
  </TouchableOpacity>
)

const sideMenuItemStyles = ({ theme }) => ({
  clickableRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    borderBottomStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    padding: theme.sizes.defaultDouble,
    paddingLeft: 0,
  },
  menuIcon: {
    marginLeft: theme.sizes.default,
    marginRight: 20,
  },
  menuText: {
    paddingRight: theme.sizes.defaultDouble,
  },
})

export default withStyles(sideMenuItemStyles)(SideMenuItem)
