import React, { useCallback, useEffect, useState } from 'react'
<<<<<<< HEAD
import { BackHandler, View } from 'react-native'
=======
import { BackHandler, CheckBox, View } from 'react-native'
>>>>>>> 522f65f6e (login-integration-ui)
import GooddollarImage from '../../assets/gooddollarLogin.svg'

import { CustomButton, Section, Text } from '../common'
import useProfile from '../../lib/userStorage/useProfile'
import API from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'
import { isMobileNative } from '../../lib/utils/platform'

const shadowObject = {
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
}

const LoginRedirect = ({
  navigation: {
    state: { params },
  },
}) => {
  const { email, walletAddress, mobile, fullName } = useProfile()
  const [details, setDetails] = useState({ country: '', isWhitelisted: null })
  const [urlDetails, setURLDetails] = useState({
    vendorAddress: null,
    vendorName: null,
    vendorURL: null,
    requestedDetails: [],
    urlType: null,
    url: null,
  })
  const [warning, setWarnings] = useState({
    isVendorWalletWhitelisted: true,
    isWebDomainDifferent: false,
  })
  const { isVendorWalletWhitelisted } = warning
  const { country, isWhitelisted } = details

  const fetchLocationAndWhiteListedStatus = useCallback(async () => {
    try {
      const urlDetails = JSON.parse(Buffer.from(decodeURIComponent(params.login), 'base64').toString('ascii'))
      setURLDetails({
        vendorAddress: urlDetails.id,
        vendorName: urlDetails.v,
        requestedDetails: urlDetails.r,
        vendorURL: urlDetails.web,
        urlType: urlDetails.cbu ? 'cbu' : 'rdu',
        url: urlDetails?.cbu ?? urlDetails?.rdu,
      })
      if (!urlDetails.web.includes(urlDetails?.cbu ?? urlDetails?.rdu)) {
        setWarnings(data => ({ ...data, isWebDomainDifferent: true }))
      }
      if (!(await goodWallet.isVerified(urlDetails.id))) {
        setWarnings(data => ({ ...data, isVendorWalletWhitelisted: false }))
      }
      const location = await API.getLocation()
      const isWhitelisted = await goodWallet.isCitizen()
      setDetails({ country: location?.name, isWhitelisted })
    } catch (e) {
      //nothing here
    }
  }, [])

  useEffect(() => {
    fetchLocationAndWhiteListedStatus()
  }, [fetchLocationAndWhiteListedStatus])

  const submit = ({ isRejected = false }) => {
    let responseurlDetails = {}
    if (!isRejected) {
      const { requestedDetails } = urlDetails
      responseurlDetails = {
        a: { value: walletAddress, attestation: '' },
        v: { value: isWhitelisted, attestation: '' },
        ...(requestedDetails.includes('location') ? { I: { value: country, attestation: '' } } : {}),
        ...(requestedDetails.includes('name') ? { n: { value: fullName, attestation: '' } } : {}),
        ...(requestedDetails.includes('email') ? { e: { value: email, attestation: '' } } : {}),
        ...(requestedDetails.includes('mobile') ? { m: { value: mobile, attestation: '' } } : {}),
        nonce: { value: Date.now(), attestation: '' },
      }
      responseurlDetails.sig = goodWallet?.wallet?.eth?.accounts?.sign(
        JSON.stringify(responseurlDetails),
        goodWallet.accounts[0].privateKey,
      ).signature
    } else {
      responseurlDetails = {
        error: 'Authorization Denied',
      }
    }
    if (isMobileNative) {
      //app native functions
      API.sendLoginVendorDetails(urlDetails.url, responseurlDetails)
        .then(() => {
          //minimize the app
          BackHandler.exitApp()
        })
        .catch(() => {
          //minimize the app
          BackHandler.exitApp()
        })
    } else {
      if (urlDetails.urlType === 'rdu') {
        const encodedData = encodeURIComponent(btoa(JSON.stringify(responseurlDetails)))
        window.location.href = `${urlDetails.url}?login=${encodedData}`
      } else {
        API.sendLoginVendorDetails(urlDetails.url, responseurlDetails)
          .then(() => {
            window.close()
          })
          .catch(() => {
            window.close()
          })
      }
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ ...shadowObject, padding: 20 }}>
        <Section>
          <View style={{ height: '100%', backgroundColor: '#fff' }}>
            <View style={{ alignItems: 'center' }}>
              <GooddollarImage />
            </View>
            <View style={{ width: '95%', alignSelf: 'center' }}>
              <Text style={{ fontSize: 30 }}>{urlDetails.vendorName}</Text>
              <View
                style={{
                  width: '100%',
                  marginTop: 20,
                  marginBottom: 10,
                  justifyContent: 'space-evenly',
                  padding: 10,
                  flexDirection: 'row',
                  backgroundColor: '#EEF0F9',
                }}
              >
                <View>
                  <Text style={{ fontSize: 16 }}>Website</Text>
                  <Text style={{ fontSize: 10 }}>{urlDetails?.vendorURL}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 16 }}>Wallet</Text>
                  <Text style={{ fontSize: 10 }}>{urlDetails?.vendorAddress?.slice(0, 12)}...</Text>
                </View>
              </View>
              <Text style={{ fontWeight: 'bold' }}>is requesting to view the following information:</Text>
<<<<<<< HEAD
              <View
                style={{
                  marginTop: 20,
=======
              <Text>(please note that you’re free to hide certain info)</Text>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
>>>>>>> 522f65f6e (login-integration-ui)
                }}
              >
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ color: '#8499BB' }}>Name</Text>
                  <Text>{fullName}</Text>
                </View>
<<<<<<< HEAD
              </View>
              <View
                style={{
                  marginTop: 20,
=======
                <CheckBox />
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
>>>>>>> 522f65f6e (login-integration-ui)
                }}
              >
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ color: '#8499BB' }}>Mobile</Text>
                  <Text>{mobile}</Text>
                </View>
<<<<<<< HEAD
              </View>
              <View
                style={{
                  marginTop: 20,
=======
                <CheckBox />
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
>>>>>>> 522f65f6e (login-integration-ui)
                }}
              >
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ color: '#8499BB' }}>Email</Text>
                  <Text>{email}</Text>
                </View>
<<<<<<< HEAD
              </View>
              <View
                style={{
                  marginTop: 20,
=======
                <CheckBox />
              </View>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginTop: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
>>>>>>> 522f65f6e (login-integration-ui)
                }}
              >
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ color: '#8499BB' }}>Location</Text>
                  <Text>{country}</Text>
                </View>
<<<<<<< HEAD
=======
                <CheckBox />
>>>>>>> 522f65f6e (login-integration-ui)
              </View>
              <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 10 }}>
                <Text style={{ color: '#8499BB' }}>Wallet Address</Text>
                <Text>{urlDetails?.vendorAddress}</Text>
              </View>
              <View style={{ width: '100%', alignItems: 'flex-start', marginTop: 10 }}>
                <Text style={{ color: '#8499BB' }}>GoodDollar verification status</Text>
                {!isVendorWalletWhitelisted && (
                  <View style={{ padding: 10, backgroundColor: 'lightyellow', marginTop: 5 }}>
                    <Text style={{ textAlign: 'flex-start', color: '#FFC700' }}>Not Verified</Text>
                  </View>
                )}
                {isVendorWalletWhitelisted && (
                  <View style={{ padding: 10, backgroundColor: '#04C899', marginTop: 5 }}>
                    <Text style={{ textAlign: 'flex-start', color: '#04C899' }}>Verified</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
                <CustomButton
                  onPress={() => submit({ isRejected: true })}
                  style={{
                    width: '48%',
                    backgroundColor: 'transparent',
                    marginRight: 20,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: '#00AFFF',
                  }}
                >
                  <Text style={{ color: '#00AFFF' }}>Deny</Text>
                </CustomButton>
                <CustomButton onPress={submit} style={{ width: '48%', borderRadius: 5, backgroundColor: '#00AFFF' }}>
                  Allow
                </CustomButton>
              </View>
<<<<<<< HEAD
=======
              {/* <Text style={{ textAlign: 'flex-start', fontSize: 18, marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{urlDetails.vendorName}</Text> is asking for the
              following details
            </Text>
            {urlDetails.requestedDetails.includes('name') && (
        <Text style={{ textAlign: 'flex-start', fontSize: 14, lineHeight: 18 }}>Name : {fullName}</Text>
            )}
            {urlDetails.requestedDetails.includes('mobile') && (
              <Text style={{ textAlign: 'flex-start', fontSize: 14, lineHeight: 18 }}>Mobile : {mobile}</Text>
            )}
            {urlDetails.requestedDetails.includes('location') && (
              <Text style={{ textAlign: 'flex-start', fontSize: 14, lineHeight: 18 }}>Location : {country}</Text>
            )}
            {urlDetails.requestedDetails.includes('email') && (
              <Text style={{ textAlign: 'flex-start', fontSize: 14, lineHeight: 18 }}>Email : {email}</Text>
            )}
            <Text style={{ textAlign: 'flex-start', fontSize: 14, lineHeight: 18 }}>
              Wallet Address : {walletAddress}
            </Text>
            <Text style={{ textAlign: 'flex-start', fontSize: 15, marginTop: 10 }}>
              Vendor&apos;s URL : <Text style={{ fontWeight: '500' }}>{urlDetails?.vendorURL}</Text>
            </Text>
            <Text style={{ marginBottom: 10, textAlign: 'flex-start', fontSize: 15 }}>
              Vendor&apos;s Wallet Address : <Text style={{ fontWeight: '500' }}>{urlDetails?.vendorAddress}</Text>
            </Text>
            <Text style={{ textAlign: 'flex-start' }}>
              Do you want to allow {urlDetails?.vendorName} to access this information?
            </Text>
            {isWebDomainDifferent && (
              <View style={{ padding: 10, backgroundColor: 'lightyellow', marginTop: 5 }}>
                <Text style={{ textAlign: 'flex-start' }}>
                  Warning ! The web url of vendor is different than the redirect/callback URL
                </Text>
              </View>
            )}
            {!isVendorWalletWhitelisted && (
              <View style={{ padding: 10, backgroundColor: 'lightyellow', marginTop: 5 }}>
                <Text style={{ textAlign: 'flex-start' }}>Warning ! The vendor wallet address is not verified !</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <CustomButton
                onPress={() => submit({ isRejected: true })}
                style={{ width: 150, backgroundColor: 'lightgrey', marginRight: 20, borderRadius: 5 }}
              >
                Deny
              </CustomButton>
              <CustomButton onPress={submit} style={{ width: 150, borderRadius: 5 }}>
                Allow
              </CustomButton>
            </View> */}
>>>>>>> 522f65f6e (login-integration-ui)
            </View>
          </View>
        </Section>
      </View>
    </View>
  )
}

export default LoginRedirect
