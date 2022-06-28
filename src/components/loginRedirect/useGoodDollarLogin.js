import { useCallback, useEffect, useState } from 'react'
import { first, forIn } from 'lodash'

import logger from '../../lib/logger/js-logger'

import useProfile from '../../lib/userStorage/useProfile'
import usePropsRefs from '../../lib/hooks/usePropsRefs'

import API from '../../lib/API/api'

import { exitApp } from '../../lib/utils/system'
import { openLink } from '../../lib/utils/linking'
import { decodeBase64Params, encodeBase64Params } from '../../lib/utils/uri'

import { useWallet } from '../../lib/wallet/GoodWalletProvider'

const log = logger.child({ from: 'useGoodDollarLogin' })
const detail = value => ({ value, attestation: '' })

const useGoodDollarLogin = params => {
  const profile = useProfile()
  const goodWallet = useWallet()
  const [getParams] = usePropsRefs([params])
  const [profileDetails, setProfileDetails] = useState({ country: '', isWhitelisted: null })

  const [parsedURL, setParsedURL] = useState({
    vendorAddress: null,
    vendorName: null,
    vendorURL: null,
    requestedDetails: [],
    urlType: null,
    url: null,
  })

  const [warnings, setWarnings] = useState({
    isVendorWalletWhitelisted: true,
    isWebDomainDifferent: false,
  })

  const sendResponse = useCallback(
    async response => {
      const { url, urlType } = parsedURL

      if (urlType === 'rdu') {
        openLink(`${url}?login=${encodeBase64Params(response)}`, '_self')
        return
      }

      try {
        await API.sendLoginVendorDetails(url, response)
      } catch (e) {
        log.warn('Error sending login vendor details', e.message, e)
      } finally {
        exitApp()
      }
    },
    [parsedURL],
  )

  const deny = useCallback(() => {
    sendResponse({ error: 'Authorization Denied' })
  }, [sendResponse])

  const allow = useCallback(() => {
    const { wallet, accounts } = goodWallet
    const { accounts: signer } = wallet.eth
    const { privateKey } = first(accounts)

    const { isWhitelisted, country } = profileDetails
    const { requestedDetails } = parsedURL
    const { email, walletAddress, mobile, fullName } = profile

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
  }, [goodWallet, parsedURL, profileDetails, profile, sendResponse])

  useEffect(() => {
    const fetchLocationAndWhiteListedStatus = async () => {
      const { login } = getParams() || {}
      const { id, v, r, web, cbu, rdu } = decodeBase64Params(login)
      const url = cbu || rdu

      const location = await API.getLocation()
      const isWebDomainDifferent = !web.includes(url)
      const isWhitelisted = await goodWallet.isCitizen()
      const isVendorWalletWhitelisted = id && (await goodWallet.isVerified(id).catch(e => false))

      setProfileDetails({ country: location?.name, isWhitelisted })
      setWarnings({ isWebDomainDifferent, isVendorWalletWhitelisted })

      setParsedURL({
        vendorAddress: id,
        vendorName: v,
        requestedDetails: r,
        vendorURL: web,
        urlType: cbu ? 'cbu' : 'rdu',
        url,
      })
    }

    fetchLocationAndWhiteListedStatus().catch(e =>
      log.warn('Error fetcing location and whitelisted status', e.message, e),
    )
  }, [goodWallet, getParams, setProfileDetails, setWarnings, setParsedURL])

  return {
    profileDetails,
    parsedURL,
    warnings,
    allow,
    deny,
  }
}

export default useGoodDollarLogin
