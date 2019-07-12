// @flow
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { PushButton } from '../../appNavigation/PushButton'

const ClaimButton = ({ screenProps, amount }) => (
  <View style={styles.claimContainer}>
    <PushButton routeName={'Claim'} screenProps={screenProps} style={styles.claimButton}>
      <Text style={styles.buttonText}>Claim</Text>
      {/* <br />
      <Text style={[styles.buttonText, styles.grayedOutText]}>+{amount}</Text> */}
    </PushButton>
  </View>
)

const styles = StyleSheet.create({
  buttonText: {
    fontSize: normalize(16),
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    textTransform: 'uppercase',
    marginHorizontal: 0,
  },
  claimContainer: {
    padding: normalize(3),
    backgroundColor: '#fff',
    zIndex: 99,
    borderRadius: '50%',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [
      {
        translateX: '-50%',
      },
      {
        translateY: '-50%',
      },
    ],
  },
  claimButton: {
    backgroundColor: '#00C3AE',
    borderRadius: '50%',
    height: normalize(70),
    width: normalize(70),
    marginHorizontal: 0,
  },
  grayedOutText: {
    color: '#d5d5d5',
    fontSize: normalize(10),
  },
})

export default ClaimButton
