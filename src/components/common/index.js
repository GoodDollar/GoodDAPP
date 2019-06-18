// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Provider } from 'react-native-paper'
import { fontStyle } from './styles'

import Address from './Address'
import Avatar from './Avatar'
import CustomDialog from './CustomDialog'
import CustomButton from './CustomButton'
import BigNumber from './BigNumber'
import BigGoodDollar from './BigGoodDollar'
import Section from './Section'
import TopBar from './TopBar'
import IconButton from './IconButton'
import InputGoodDollar from './InputGoodDollar'
import UserAvatar from './UserAvatar'
import CustomSnackbar from './CustomSnackbar'

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
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'column',
    width: '100%',
    padding: '1rem'
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

export {
  Address,
  Avatar,
  UserAvatar,
  CustomButton,
  Wrapper,
  Section,
  BigNumber,
  BigGoodDollar,
  TopBar,
  IconButton,
  CustomDialog,
  InputGoodDollar,
  CustomSnackbar
}
