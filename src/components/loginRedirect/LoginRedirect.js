import React from 'react'
import { View } from 'react-native'
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
                  <Text style={{ color: '#00AFFF' }}>Deny</Text>
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
      backgroundColor: '#fff',
      margin: 5,
      shadowColor: '#000',
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
      backgroundColor: '#EEF0F9',
    },
    detailHeading: {
      fontSize: 16,
    },
    detail: {
      fontSize: 10,
    },
    denyButton: {
      width: '48%',
      backgroundColor: 'transparent',
      marginRight: 20,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#00AFFF',
    },
    allowButton: { width: '48%', borderRadius: 5, backgroundColor: '#00AFFF' },
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
      color: '#8499BB',
    },
    verifiedView: {
      padding: 10,
      backgroundColor: '#04C89926',
      marginTop: 5,
    },
    verifiedText: {
      textAlign: 'flex-start',
      color: '#04C899',
    },
    unVerifiedView: {
      padding: 10,
      backgroundColor: 'lightyellow',
      marginTop: 5,
    },
    unVerifiedText: {
      textAlign: 'flex-start',
      color: '#FFC700',
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
