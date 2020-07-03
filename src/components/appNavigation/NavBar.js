//@flow
import React from 'react'
import { Appbar } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import { Icon } from '../common'
import { isMobile } from '../../lib/utils/platform'

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
    const { styles } = this.props

    return (
      <NavigationBar dark style={styles.topbarStyles}>
        {this.props.goBack && (
          <Icon name="arrow-back" onPress={this.props.goBack} color="white" size={22} style={styles.backButton} />
        )}
        <Appbar.Content title={this.props.title} titleStyle={styles.titleStyle} />
        {this.props.goBack && <Appbar.Action color="white" />}
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
    boxShadow: 'none',
    elevation: 0,
  },
  backButton: {
    marginLeft: 15,
    width: 33,
  },
})

export default withStyles(getStylesFromProps)(NavBar)
