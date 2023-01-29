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

const defaultIconSize = 23

const SideMenuItem = ({ icon, name, color, action, styles, theme, size, centered, external }: SideMenuItemProps) => {
  const { colors } = theme
  const handlePress = useOnPress(() => action(), [action])
  const iconColor = colors[color === undefined ? 'primary' : color]

  return (
    <TouchableOpacity style={styles.clickableRow} onPress={handlePress}>
      <View style={[styles.menuIcon, styles.menuIconMain, centered && styles.centeredIcon]}>
        <Icon name={icon} size={size ? size : icon === 'gooddollar' ? 16 : defaultIconSize} color={iconColor} />
      </View>
      <Text style={styles.menuText} color={color} fontWeight="medium" textAlign="left" fontSize={14}>
        {name}
      </Text>
      {external && (
        <View style={styles.menuIcon}>
          <Icon name="link" size={size || defaultIconSize} color={iconColor} />
        </View>
      )}
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
    paddingRight: 0,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  menuIcon: {
    marginLeft: theme.sizes.default,
    width: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuIconMain: {
    marginRight: 25,
  },
  centeredIcon: {
    alignItems: 'center',
  },
  menuText: {
    width: '100%',
  },
})

export default withStyles(sideMenuItemStyles)(SideMenuItem)
