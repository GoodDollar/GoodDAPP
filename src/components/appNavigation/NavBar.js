//@flow
import React from 'react'
import { Platform } from 'react-native'
import { Appbar } from 'react-native-paper'

import { IconButton } from '../common'

import normalize from '../../lib/utils/normalizeText'
import { isMobile } from '../../lib/utils/platform'
import { getShadowStyles } from '../../lib/utils/getStyles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

import { withStyles } from '../../lib/styles'
import HeaderLogoImage from '../../assets/header-logo.svg'

/**
 * NavigationBar shows title and back button
 * @name NavBar
 * @param {NavBarProps} props
 */

const NavigationBar = isMobile ? Appbar.Header : Appbar

const NavBar = ({ title, styles, goBack, backToWallet = false, logo = false }) => {
  const showLogo = !!logo
  const showBack = !logo && !!goBack
  const showBackButton = showBack && !backToWallet
  const showBackToWallet = showBack && !!backToWallet

  return (
    <NavigationBar dark style={styles.topbarStyles}>
      {showLogo ? (
        <HeaderLogoImage />
      ) : showBackButton ? (
        <IconButton
          name="arrow-back"
          onPress={goBack}
          color="white"
          reverse={false}
          reverseColor={'transparent'}
          size={22}
          style={styles.backButton}
        />
      ) : null}
      <Appbar.Content title={title} titleStyle={styles.titleStyle} />
      {showBackButton && <Appbar.Action color="white" />}
      {showBackToWallet && (
        <IconButton
          name="wallet"
          reverse={false}
          reverseColor={'transparent'}
          onPress={goBack}
          color="white"
          size={36}
          style={styles.walletButton}
        />
      )}
    </NavigationBar>
  )
}

const getStylesFromProps = ({ theme }) => ({
  titleStyle: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.colors.surface,
    fontSize: getDesignRelativeHeight(normalize(16)),
    fontWeight: '500',
  },
  topbarStyles: {
    height: getDesignRelativeHeight(55),
    flexGrow: 0,
    flexShrink: 0,
    ...getShadowStyles('none', { elevation: 0 }),
  },
  backButton: {
    marginLeft: 15,
    width: 33,
    flex: Platform.select({ native: 0 }),
    justifyContent: 'center',
  },
  walletButton: {
    position: 'absolute',
    right: 15,
    width: 33,
  },
})

export default withStyles(getStylesFromProps)(NavBar)
