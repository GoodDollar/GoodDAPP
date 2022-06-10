import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { first, forIn } from 'lodash'
import GooddollarImage from '../../assets/gooddollarLogin.svg'

import { CustomButton, Section, Text } from '../common'
import useProfile from '../../lib/userStorage/useProfile'
import API from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import usePropsRefs from '../../lib/hooks/usePropsRefs'
import { exitApp } from '../../lib/utils/system'
import { decodeBase64Params, encodeBase64Params } from '../../lib/utils/uri'
import { openLink } from '../../lib/utils/linking'

const log = logger.child({ from: 'LoginRedirect' })

const LoginRedirect = ({ navigation, styles }) => {
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
  const [getParams] = usePropsRefs([navigation?.state?.params])

  useEffect(() => {
    const fetchLocationAndWhiteListedStatus = async () => {
      try {
        const { login } = getParams() || {}
        const { id, v, r, web, cbu, rdu } = decodeBase64Params(login)
        const url = cbu || rdu
        const location = await API.getLocation()
        const isWhitelisted = await goodWallet.isCitizen()
        setDetails({ country: location?.name, isWhitelisted })
        setURLDetails({
          vendorAddress: id,
          vendorName: v,
          requestedDetails: r,
          vendorURL: web,
          urlType: cbu ? 'cbu' : 'rdu',
          url,
        })
        if (!web.includes(urlDetails?.cbu ?? urlDetails?.rdu)) {
          setWarnings(data => ({ ...data, isWebDomainDifferent: true }))
        }
        if (!(await goodWallet.isVerified(id))) {
          setWarnings(data => ({ ...data, isVendorWalletWhitelisted: false }))
        }
      } catch (e) {
        //nothing here
      }
    }
    fetchLocationAndWhiteListedStatus().catch(e =>
      log.warn('Error fetcing location and whitelisted status', e.message, e),
    )
  }, [getParams, setDetails, setWarnings, setURLDetails])

  const sendResponse = useCallback(
    response => {
      const { url, urlType } = urlDetails
      if (urlType === 'rdu') {
        openLink(`${url}?login=${encodeBase64Params(response)}`, '_self')
        return
      }
      API.sendLoginVendorDetails(url, response)
        .catch(e => log.warn('Error sending login vendor details', e.message, e))
        .finally(exitApp)
    },
    [urlDetails],
  )
  const deny = useCallback(() => {
    sendResponse({ error: 'Authorization Denied' })
  }, [sendResponse])

  const allow = useCallback(() => {
    const { wallet, accounts } = goodWallet
    const { accounts: signer } = wallet.eth
    const { privateKey } = first(accounts)
    const { requestedDetails } = urlDetails
    const detail = value => ({ value, attestation: '' })

    const map = {
      location: ['I', country],
      name: ['n', fullName],
      email: ['e', email],
      mobile: ['m', mobile],
    }

    const response = {
      a: detail(walletAddress),
      v: detail(isWhitelisted),
      nonce: detail(Date.now()),
    }
    forIn(map, ([property, value], requested) => {
      if (!requestedDetails.includes(requested)) {
        return
      }
      response[property] = detail(value)
    })
    const { signature } = signer.sign(JSON.stringify(response), privateKey)
    sendResponse({ ...response, sig: signature })
  }, [urlDetails, sendResponse, country, isWhitelisted, fullName, email, mobile, walletAddress])

  return (
    <View style={styles.topContainer}>
      <View style={styles.shadowBackground}>
        <Section>
          <View>
            <View style={styles.imageContainer}>
              <GooddollarImage />
            </View>
            <View style={styles.container}>
              <Text style={styles.vendorName}>{urlDetails.vendorName}</Text>
              <View style={styles.detailsView}>
                <View>
                  <Text style={{ fontSize: 16 }}>Website</Text>
                  <Text style={{ fontSize: 10 }}>{urlDetails?.vendorURL}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 16 }}>Wallet</Text>
                  <Text style={{ fontSize: 10 }}>{urlDetails?.vendorAddress?.slice(0, 12)}...</Text>
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
                <Text>{urlDetails?.vendorAddress}</Text>
              </View>
              <View style={styles.infoView}>
                <Text style={styles.labelText}>GoodDollar verification status</Text>
                {!isVendorWalletWhitelisted && (
                  <View style={styles.unVerifiedView}>
                    <Text style={styles.unVerifiedText}>Not Verified</Text>
                  </View>
                )}
                {isVendorWalletWhitelisted && (
                  <View style={styles.verifiedView}>
                    <Text style={styles.verifiedText}>Verified</Text>
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
