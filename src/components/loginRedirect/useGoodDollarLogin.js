import { useCallback, useEffect, useMemo, useState } from 'react'
import { assign, first, forIn, pick, values } from 'lodash'

import logger from '../../lib/logger/js-logger'

import useProfile from '../../lib/userStorage/useProfile'
import usePropsRefs from '../../lib/hooks/usePropsRefs'

import API from '../../lib/API/api'

import { decodeBase64Params } from '../../lib/utils/uri'

import { useWallet } from '../../lib/wallet/GoodWalletProvider'
import { redirectTo } from '../../lib/utils/linking'

const log = logger.child({ from: 'useGoodDollarLogin' })

const detail = value => ({ value, attestation: '' })

const useGoodDollarLogin = params => {
  const profile = useProfile()
  const goodWallet = useWallet()
  const [getParams] = usePropsRefs([params])
  const [profileOptions, setProfileOptions] = useState({ country: '', isWhitelisted: null })

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

  const [profileDetails, shortDetails] = useMemo(() => {
    const { country } = profileOptions
    const { requestedDetails } = parsedURL
    const { email, mobile, fullName } = profile

    const map = {
      location: ['I', { country }],
      name: ['n', { fullName }],
      email: ['e', { email }],
      mobile: ['m', { mobile }],
    }

    const details = {}
    const short = {}

    forIn(map, ([property, chunk], requested) => {
      if (!requestedDetails.includes(requested)) {
        return
      }

      const value = first(values(chunk))

      assign(details, chunk)
      short[property] = detail(value)
    })

    return [details, short]
  }, [parsedURL, profileOptions, profile])

  const sendResponse = useCallback(
    async response => {
      const { url, urlType } = parsedURL

      await redirectTo(url, urlType, response)
    },
    [parsedURL],
  )

  const deny = useCallback(() => {
    sendResponse({ error: 'Authorization Denied' })
  }, [sendResponse])

  const allow = useCallback(async () => {
    const { isWhitelisted } = profileOptions
    const { walletAddress } = profile

    const response = {
      ...shortDetails,
      a: detail(walletAddress),
      v: detail(isWhitelisted),
      nonce: detail(Date.now()),
    }

    const signature = await goodWallet.sign(JSON.stringify(response))

    sendResponse(signature)
  }, [goodWallet, shortDetails, profileOptions, profile, sendResponse])

  useEffect(() => {
    const getVendorWalletWhitelistedStatus = async id => {
      if (!id) {
        log.warn('No vendor ID specified, assuming as "not whitelisted"')
        return false
      }

      try {
        return await goodWallet.isVerified(id)
      } catch (e) {
        log.warn('Error fetching vendor walled whitelisted status', e.message, e)
      }
    }

    const fetchLocationAndWhiteListedStatus = async () => {
      const { login } = getParams() || {}
      const { id, v, r, web, cbu, rdu } = decodeBase64Params(login)
      const url = cbu || rdu

      const location = await API.getLocation()
      const isWebDomainDifferent = !web.includes(url)
      const isWhitelisted = await goodWallet.isCitizen()
      const isVendorWalletWhitelisted = await getVendorWalletWhitelistedStatus(id)

      setProfileOptions({ country: location?.name, isWhitelisted })
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
  }, [goodWallet, getParams, setProfileOptions, setWarnings, setParsedURL])

  const vendorDetails = pick(parsedURL || {}, 'vendorName', 'vendorURL', 'vendorAddress')
  const { isWhitelisted } = profileOptions

  return {
    isWhitelisted,
    vendorDetails,
    profileDetails,
    warnings,
    allow,
    deny,
  }
}

export default useGoodDollarLogin
