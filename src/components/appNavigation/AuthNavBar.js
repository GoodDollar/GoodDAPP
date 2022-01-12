//@flow
import React from 'react'
import { Appbar } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { getShadowStyles } from '../../lib/utils/getStyles'
import { isMobile } from '../../lib/utils/platform'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import HeaderLogoImage from '../../assets/header-logo.svg'

/**
 * NavigationBar shows title and back button
 * @name NavBar
 * @param {NavBarProps} props
 */

const NavigationBar = isMobile ? Appbar.Header : Appbar

class AuthNavBar extends React.Component<NavBarProps> {
  render() {
    const { styles } = this.props

    return (
      <NavigationBar dark style={styles.topbarStyles}>
        <HeaderLogoImage />
      </NavigationBar>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  topbarStyles: {
    height: getDesignRelativeHeight(40),
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadowStyles('none', { elevation: 0 }),
  },
})

export default withStyles(getStylesFromProps)(AuthNavBar)
