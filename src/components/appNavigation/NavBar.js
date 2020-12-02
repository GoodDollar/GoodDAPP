//@flow
import React from 'react'
import { Platform } from 'react-native'
import { Appbar } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import { getShadowStyles } from '../../lib/utils/getStyles'
import { isMobile } from '../../lib/utils/platform'
import { IconButton } from '../common'

/**
 * @type
 */
type NavBarProps = {
  goBack?: () => void,
  title: string,
}

/**
 * NavigationBar shows title and back button
 * @name NavBar
 * @param {NavBarProps} props
 */

const NavigationBar = isMobile ? Appbar.Header : Appbar

class NavBar extends React.Component<NavBarProps> {
  render() {
    const { styles, backToWallet = false } = this.props

    return (
      <NavigationBar dark style={styles.topbarStyles}>
        {!backToWallet && this.props.goBack && (
          <IconButton
            name="arrow-back"
            onPress={this.props.goBack}
            color="white"
            reverse={false}
            reverseColor={'transparent'}
            size={22}
            style={styles.backButton}
          />
        )}
        <Appbar.Content title={this.props.title} titleStyle={styles.titleStyle} />
        {!backToWallet && this.props.goBack && <Appbar.Action color="white" />}
        {backToWallet && this.props.goBack && (
          <IconButton
            name="wallet"
            reverse={false}
            reverseColor={'transparent'}
            onPress={this.props.goBack}
            color="white"
            size={36}
            style={styles.walletButton}
          />
        )}
      </NavigationBar>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  titleStyle: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.colors.surface,
    fontSize: normalize(16),
    fontWeight: '500',
  },
  topbarStyles: {
    flexGrow: 0,
    flexShrink: 0,
    ...getShadowStyles('none', { elevation: 0 }),
  },
  backButton: {
    marginLeft: 15,
    width: 33,
    flex: Platform.select({ web: 'inherit', default: 0 }),
    justifyContent: 'center',
  },
  walletButton: {
    position: 'absolute',
    right: 15,
    width: 33,
  },
})

export default withStyles(getStylesFromProps)(NavBar)
