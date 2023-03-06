import { map, mapValues, sum, toLower } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'

import Config from '../../../config/config'
import logger from '../../../lib/logger/js-logger'
import API from '../../../lib/API'

export const REFUNDED_FLAG = 'noRefundRequired'

const { enableRefund } = Config
const log = logger.child({ from: 'useRefund' })

const incidentStart = 17896430
const incidentEnd = 17916430
const claimAmount = 8210995

// test data:
// account = '0x64E9644DF7C6457Fb09f984ea9527F5506864879'
// UBI contract addess = '0xd253A5203817225e9768C05E5996d642fb96bA86'
// token contract address = '0x495d133b938596c9984d462f007b676bdc57ecec'

const useRefund = () => {
  const userStorage = useUserStorage()
  const [shouldRefund, setShouldRefund] = useState(undefined)
  const [refundAmount, setRefundAmount] = useState(0)
  const wallet = useWallet()

  const [claimAddress, tokenAddress] = useMemo(() => {
    const getAddress = contract => wallet[contract]._address

    if (!wallet) {
      return []
    }

    return ['UBIContract', 'tokenContract'].map(getAddress)
  }, [wallet])

  useEffect(() => {
    const { userProperties } = userStorage || {}

    const fetchAmountsFromEvents = async (contract, event, filters) => {
      const events = await contract.getPastEvents(event, filters)
      const amounts = map(events, 'returnValues.amount').map(Number)

      log.debug('Got amounts from events', { amounts })
      return amounts
    }

    const fetchAmountsFromExplorer = async (contract, filters) => {
      const { filter, fromBlock } = filters
      const { from, to } = mapValues(filter, toLower)
      const contractAddress = toLower(contract)
      const result = await API.getTokenTXs(contractAddress, from, fromBlock)

      // filter & map in a single iteration
      const amounts = result.reduce((values, txData) => {
        const { to: toAddress, value } = txData

        if (toAddress !== to) {
          return values
        }

        return [...values, Number(value)]
      }, [])

      log.debug('Got amounts from explorer', { amounts })
      return amounts
    }

    const checkSentReceived = async () => {
      const { UBIContract, account } = wallet

      // 1. request last claims, fetch amounts
      // 2. fetch amounts by 2 buggy claim dates only
      // 3. find max amount reached threshold
      const claimFilters = { filter: { claimer: account }, fromBlock: incidentStart, toBlock: incidentEnd }
      const claimAmounts = await fetchAmountsFromEvents(UBIContract, 'UBIClaimed', claimFilters)
      const maxAmount = sum(claimAmounts.filter(amount => amount >= claimAmount)) || 0

      log.debug('Searching for max amount reached threshold', { maxAmount, claimAmounts, account })

      // if huge claim found - checking does the user already restored money back
      if (maxAmount) {
        // fetch refunded from the first block of the first incident till now
        const refundFilters = { filter: { from: account, to: claimAddress }, fromBlock: incidentStart }
        const refundedAmounts = await fetchAmountsFromExplorer(tokenAddress, refundFilters)
        const totalRefunded = sum(refundedAmounts) || 0
        const debt = maxAmount - totalRefunded

        log.debug('Max amount is found', { maxAmount, refundedAmounts, totalRefunded, debt })

        if (debt > 0) {
          log.debug('Debt is found', { maxAmount, refundedAmounts, totalRefunded, debt })

          setShouldRefund(true)
          setRefundAmount(debt)
          return
        }
      }

      setShouldRefund(false)
      userProperties.setLocal(REFUNDED_FLAG, true)
    }

    if (!enableRefund || !userProperties || !wallet) {
      log.debug('Check send receive skipping', {
        enableRefund,
        wallet: !!wallet,
        userProperties: !!userProperties,
      })

      return
    }

    userProperties.ready.then(() => {
      const haveRefunded = userProperties.getLocal(REFUNDED_FLAG)

      log.debug('Checking refunded flag state', { haveRefunded })

      if (!haveRefunded) {
        log.debug('Checking send receive')
        checkSentReceived()
      }
    })
  }, [wallet, userStorage, claimAddress, tokenAddress])

  return [shouldRefund, wallet.toDecimals(refundAmount), claimAddress]
}

export default useRefund
