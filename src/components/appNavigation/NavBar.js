//@flow
import React from 'react'
import { Appbar } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'

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
class NavBar extends React.Component<NavBarProps> {
  render() {
    const { styles } = this.props

    return (
      <Appbar.Header dark style={styles.topbarStyles}>
        {this.props.goBack && <Appbar.BackAction onPress={this.props.goBack} color="white" />}
        <Appbar.Content title={this.props.title} titleStyle={styles.titleStyle} />
        {this.props.goBack && <Appbar.Action color="white" />}
      </Appbar.Header>
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
  },
})

export default withStyles(getStylesFromProps)(NavBar)
