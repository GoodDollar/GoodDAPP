import React from 'react'
import { View } from 'react-native'
import { Colors } from 'react-native-paper'
import { get, truncate } from 'lodash'

import { CustomButton, Section, Text } from '../common'

import useProfile from '../../lib/userStorage/useProfile'

import { withStyles } from '../../lib/styles'
import GooddollarImage from '../../assets/gooddollarLogin.svg'
import useGoodDollarLogin from './useGoodDollarLogin'

const LoginRedirect = ({ navigation, styles }) => {
  const profile = useProfile()
  const { params } = get(navigation, 'state', {})

  const { profileDetails, parsedURL, warnings, allow, deny } = useGoodDollarLogin(params)

  const { isVendorWalletWhitelisted } = warnings || {}
  const { country } = profileDetails || {}
  const { vendorName, vendorURL, vendorAddress = '' } = parsedURL || {}
  const { email, mobile, fullName } = profile

  return (
    <View style={styles.topContainer}>
      <View style={styles.shadowBackground}>
        <Section>
          <View>
            <View style={styles.imageContainer}>
              <GooddollarImage />
            </View>
            <View style={styles.container}>
              <Text style={styles.vendorName}>{vendorName}</Text>
              <View style={styles.detailsView}>
                <View>
                  <Text style={styles.detailHeading}>Website</Text>
                  <Text style={styles.detail}>{vendorURL}</Text>
                </View>
                <View>
                  <Text style={styles.detailHeading}>Wallet</Text>
                  <Text style={styles.detail}>{truncate(vendorAddress, { length: 12 })}</Text>
                </View>
              </View>
              <Text style={styles.boldText}>is requesting to view the following information:</Text>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>Name</Text>
                <Text>{fullName}</Text>
              </View>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>Mobile</Text>
                <Text>{mobile}</Text>
              </View>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>Email</Text>
                <Text>{email}</Text>
              </View>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>Location</Text>
                <Text>{country}</Text>
              </View>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>Wallet Address</Text>
                <Text>{vendorAddress}</Text>
              </View>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>GoodDollar verification status</Text>
                {isVendorWalletWhitelisted ? (
                  <View style={styles.verifiedView}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : (
                  <View style={styles.unVerifiedView}>
                    <Text style={styles.unVerifiedText}>Not Verified</Text>
                  </View>
                )}
              </View>
              <View style={styles.buttonContainer}>
                <CustomButton onPress={deny} style={styles.denyButton}>
                  <Text style={styles.denyText}>Deny</Text>
                </CustomButton>
                <CustomButton onPress={allow} style={styles.allowButton}>
                  Allow
                </CustomButton>
              </View>
            </View>
          </View>
        </Section>
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const { colors, sizes } = theme
  const { borderRadius, defaultDouble } = sizes
  const { primary, white, lightBlue, lighterGreen } = colors
  const { black } = Colors

  return {
    topContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    container: {
      width: '95%',
      alignSelf: 'center',
    },
    shadowBackground: {
      backgroundColor: white,
      margin: 5,
      shadowColor: black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      padding: 20,
    },
    imageContainer: {
      alignItems: 'center',
    },
    detailsView: {
      width: '100%',
      marginTop: 20,
      marginBottom: 10,
      justifyContent: 'space-evenly',
      padding: 10,
      flexDirection: 'row',
      backgroundColor: '#eef0f9',
    },
    detailHeading: {
      fontSize: defaultDouble,
    },
    detail: {
      fontSize: 10,
    },
    denyButton: {
      width: '48%',
      backgroundColor: 'transparent',
      marginRight: 20,
      borderRadius,
      borderWidth: 1,
      borderColor: primary,
    },
    denyText: {
      color: primary,
    },
    allowButton: {
      width: '48%',
      borderRadius,
      backgroundColor: primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 10,
      justifyContent: 'space-between',
    },
    infoView: {
      alignItems: 'flex-start',
      marginTop: 20,
      width: '100%',
    },
    labelText: {
      color: lightBlue,
    },
    verifiedView: {
      padding: 10,
      backgroundColor: lighterGreen,
      marginTop: 5,
    },
    verifiedText: {
      textAlign: 'flex-start',
      color: lighterGreen,
    },
    unVerifiedView: {
      padding: 10,
      backgroundColor: '#ffffe0',
      marginTop: 5,
    },
    unVerifiedText: {
      textAlign: 'flex-start',
      color: '#ffc700',
    },
    boldText: {
      fontWeight: 'bold',
    },
    vendorName: {
      fontSize: 30,
    },
  }
}

export default withStyles(getStylesFromProps)(LoginRedirect)
