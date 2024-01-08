// @flow
import React from 'react'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'

import useSideMenu from '../../lib/hooks/useSideMenu'
import { withStyles } from '../../lib/styles'
import { ActionButton, Icon } from '../common'
import useOnPress from '../../lib/hooks/useOnPress'

//assets
import DiscordLogo from '../../assets/logos/socials/discord.png'
import DiscourseLogo from '../../assets/logos/socials/discourse.png'
import XLogo from '../../assets/logos/socials/Twitter-X.png'
import TgLogo from '../../assets/logos/socials/telegram.png'
import FacebookLogo from '../../assets/logos/socials/facebook.png'
import MediumLogo from '../../assets/logos/socials/medium.png'
import GdWebLogo from '../../assets/logos/socials/GdLogo.png'
import InstaLogo from '../../assets/logos/socials/instagram.png'
import LinkedinLogo from '../../assets/logos/socials/linkedin.png'

import SideMenuItem from './SideMenuItem'

export const socialIcons = {
  gdw: GdWebLogo,
  tg: TgLogo,
  x: XLogo,
  dsc: DiscourseLogo,
  inst: InstaLogo,
  dis: DiscordLogo,
  med: MediumLogo,
  fb: FacebookLogo,
  link: LinkedinLogo,
}

type SideMenuPanelProps = {
  navigation: any,
}

const SideMenuPanel = ({ navigation, styles, theme }: SideMenuPanelProps) => {
  const { slideToggle, topItems } = useSideMenu({
    navigation,
    theme,
  })

  const onPressClose = useOnPress(slideToggle)

  return (
    <ScrollView contentContainerStyle={styles.scrollableContainer}>
      <TouchableOpacity style={styles.closeIconRow} onPress={onPressClose} testID="close_burger_button">
        <Icon name="close" size={20} color={theme.colors.lighterGray} />
      </TouchableOpacity>
      <View style={styles.listContainer}>
        {topItems.map(item => !item.hidden && <SideMenuItem key={item.name} {...item} />)}
        <View style={styles.alignBottom}>
          {Object.entries(socialIcons).map(([key, logo]) => (
            <ActionButton action={key} key={key} image={logo} />
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const sideMenuPanelStyles = ({ theme }) => ({
  scrollableContainer: {
    flexGrow: 1,
  },
  closeIconRow: {
    flex: -1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.sizes.defaultDouble,
    paddingBottom: theme.sizes.defaultQuadruple,
    marginHorizontal: theme.sizes.defaultDouble,
    minHeight: 20,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  listContainer: {
    flexGrow: 1,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    ...Platform.select({
      web: {
        borderTopStyle: 'solid',
      },
    }),
    marginHorizontal: theme.sizes.defaultDouble,
  },
  alignBottom: {
    marginTop: 'auto',
    marginBottom: 32,
    ...Platform.select({
      web: {
        width: 250,
      },
      android: {
        width: 350,
      },
    }),
    flexDirection: 'row',
    flexWrap: 'wrap-reverse',
    justifyContent: 'center',
  },
})

export default withStyles(sideMenuPanelStyles)(SideMenuPanel)
