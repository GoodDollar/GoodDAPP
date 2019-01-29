//@flow
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import backButton from '../../assets/backButton.png'

type NavBarProps = {
  pop: () => void,
  title: string
}

class NavBar extends React.Component<NavBarProps> {
  render() {
    return (
      <View style={styles.navBar}>
        <View style={styles.left}>
          <View style={styles.backButton} onClick={this.props.pop} />
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
    backgroundColor: '#909090',
    color: '#d2d2d2'
  },
  title: {
    textTransform: 'uppercase',
    fontSize: '18px',
    flexGrow: 2,
    textAlign: 'center'
  },
  backButton: {
    height: '25px',
    width: '25px',
    cursor: 'pointer',
    background: `url(${backButton})`
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
