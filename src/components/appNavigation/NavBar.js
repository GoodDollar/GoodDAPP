//@flow
import React from 'react'
import { Appbar } from 'react-native-paper'
import { StyleSheet } from 'react-native'

/**
 * @type
 */
type NavBarProps = {
  goBack?: () => void,
  title: string
}

/**
 * NavigationBar shows title and back button
 * @name NavBar
 * @param {NavBarProps} props
 */
class NavBar extends React.Component<NavBarProps> {
  render() {
    return (
      <Appbar.Header dark>
        {this.props.goBack && <Appbar.BackAction onPress={this.props.goBack} />}
        <Appbar.Content title={this.props.title} titleStyle={styles.titleStyle} />
        {this.props.goBack && <Appbar.Action />}
      </Appbar.Header>
    )
  }
}

const styles = StyleSheet.create({
  titleStyle: {
    textTransform: 'uppercase',
    textAlign: 'center'
  }
})

export default NavBar
