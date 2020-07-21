// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'
import useOnPress from '../../lib/hooks/useOnPress'

export type SideMenuItemProps = {
  icon: string,
  name: string,
  action: Function,
}

const SideMenuItem = ({ icon, name, color, action, styles, theme, size, centered }: SideMenuItemProps) => {
  const _onPress = useOnPress(action, [action])
  return (
    <TouchableOpacity style={styles.clickableRow} onPress={_onPress}>
      <View style={[styles.menuIcon, centered && styles.centeredIcon]}>
        <Icon
          name={icon}
          size={size ? size : icon === 'gooddollar' ? 16 : 23}
          color={color === undefined ? theme.colors.primary : theme.colors[color]}
        />
      </View>
      <Text color={color} fontWeight="medium" textAlign="left" fontSize={14}>
        {name}
      </Text>
    </TouchableOpacity>
  )
}

const sideMenuItemStyles = ({ theme }) => ({
  clickableRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    borderStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    padding: theme.sizes.defaultDouble,
    paddingLeft: 0,
  },
  menuIcon: {
    marginLeft: theme.sizes.default,
    marginRight: 30,
    width: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centeredIcon: {
    alignItems: 'center',
  },
  menuText: {
    paddingRight: theme.sizes.defaultDouble,
  },
})

export default withStyles(sideMenuItemStyles)(SideMenuItem)
