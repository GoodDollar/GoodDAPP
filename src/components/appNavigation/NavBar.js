//@flow
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import backButton from '../../assets/backButton.png'

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
      <View style={styles.navBar}>
        <View style={styles.left}>
          {this.props.goBack && <TouchableOpacity style={styles.backButton} onPress={this.props.goBack} />}
        </View>
        <Text style={styles.title}>{this.props.title}</Text>
        <View style={styles.right} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
    backgroundColor: '#909090'
  },
  title: {
    textTransform: 'uppercase',
    fontSize: '18px',
    flexGrow: 2,
    textAlign: 'center',
    color: '#d2d2d2'
  },
  backButton: {
    height: '25px',
    width: '25px',
    cursor: 'pointer',
    backgroundImage: `url(${backButton})`
  },
  left: {
    padding: 10,
    minWidth: '40px'
  },
  right: {
    minWidth: '40px'
  }
})

export default NavBar
