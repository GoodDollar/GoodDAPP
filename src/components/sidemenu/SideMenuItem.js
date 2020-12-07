// @flow

// libraries
import React from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'

// components
import { Icon, Text } from '../common'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'

// utils
import { withStyles } from '../../lib/styles'

export type SideMenuItemProps = {
  icon: string,
  name: string,
  action: Function,
}

const SideMenuItem = ({ icon, name, color, action, styles, theme, size, centered }: SideMenuItemProps) => {
  const handlePress = useOnPress(() => action(), [action])

  return (
    <TouchableOpacity style={styles.clickableRow} onPress={handlePress}>
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
    padding: theme.sizes.defaultDouble,
    paddingLeft: 0,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  menuIcon: {
    marginLeft: theme.sizes.default,
    marginRight: 25,
    width: 25,
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
