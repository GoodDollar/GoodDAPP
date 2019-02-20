// @flow
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'
import { Provider } from 'react-native-paper'
import { fontStyle } from './styles'

import Address from './Address'
import Avatar from './Avatar'
import CustomButton from './CustomButton'
import BigNumber from './BigNumber'
import Section from './Section'
import TopBar from './TopBar'
import IconButton from './IconButton'

export * from './CustomButton'

const Wrapper = (props: any) => {
  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={[styles.wrapper, props.style]} {...props}>
            {props.children}
          </View>
        </View>
      </View>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, display: 'flex' },
  contentContainer: { justifyContent: 'center', flexDirection: 'row', flex: 1, alignItems: 'stretch', display: 'flex' },
  wrapper: {
    display: 'flex',
    maxWidth: '500px',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'column',
    padding: normalize(10)
  },
  section: {
    backgroundColor: '#eeeeef',
    borderRadius: normalize(5),
    padding: normalize(10),
    paddingTop: normalize(15),
    paddingBottom: normalize(15),
    marginBottom: normalize(15)
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  linkButton: {
    color: '#555',
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(18),
    textAlign: 'center',
    marginTop: normalize(10)
  },
  topContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: normalize(30)
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end'
  },
  title: {
    ...fontStyle,
    fontSize: normalize(28),
    marginBottom: normalize(30)
  },
  description: {
    ...fontStyle,
    marginTop: normalize(30)
  }
})

export { Address, Avatar, CustomButton, Wrapper, Section, BigNumber, TopBar, IconButton }
