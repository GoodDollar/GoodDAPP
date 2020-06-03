//@flow
import React from 'react'
import { Appbar } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import useOnPress from '../../lib/hooks/useOnPress'
import { Icon } from '../common'

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
const NavBar = ({ styles, goBack }: NavBarProps) => {
  const handleIconPress = useOnPress(() => goBack, [goBack])

  return (
    <Appbar dark style={styles.topbarStyles}>
      {goBack && <Icon name="arrow-back" onPress={handleIconPress} color="white" size={22} style={styles.backButton} />}
      <Appbar.Content title={this.props.title} titleStyle={styles.titleStyle} />
      {goBack && <Appbar.Action color="white" />}
    </Appbar>
  )
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
  backButton: {
    marginLeft: 15,
    width: 33,
  },
})

export default withStyles(getStylesFromProps)(NavBar)
