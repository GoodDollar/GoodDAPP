import { map, mapValues, sum, toLower } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'

import Config from '../../../config/config'
import logger from '../../../lib/logger/js-logger'

export const REFUNDED_FLAG = 'noRefundRequired'

const { enableRefund } = Config
const EXPLORER_API = 'https://explorer.fuse.io/api'
const log = logger.child({ from: 'useRefund' })

const incidentStart = 17896430
const incidentEnd = 17916430
const claimAmount = 8210995

// test data:
// account = '0xd253A5203817225e9768C05E5996d642fb96bA86'
// UBI contract addess = '0xd253A5203817225e9768C05E5996d642fb96bA86'
// token contract address = '0x495d133b938596c9984d462f007b676bdc57ecec'

const useRefund = () => {
  const userStorage = useUserStorage()
  const [shouldRefund, setShouldRefund] = useState(undefined)
  const [refundAmount, setRefundAmount] = useState(0)
  const wallet = useWallet()

  const claimAddress = useMemo(() => wallet?.UBIContract._address, [wallet])
  const tokenAddress = useMemo(() => wallet?.tokenContract._address, [wallet])

  useEffect(() => {
    const { userProperties } = userStorage || {}
    const haveRefunded = userProperties ? userProperties.getLocal(REFUNDED_FLAG) : false

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

      const {
        data: { result },
      } = await axios({
        url: '/',
        baseURL: EXPLORER_API,
        params: {
          module: 'account',
          action: 'tokentx',
          address: from,
          contractaddress: contractAddress,
          startblock: fromBlock,
        },
      })

      // filter & map in a single iteration
      const amounts = result.reduce(
        (values, { to: _to, value }) => (_to === to ? values.concat(Number(value)) : values),
        [],
      )

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

    if (!enableRefund || !userProperties || !wallet || haveRefunded) {
      log.debug('Check send receive skipping', {
        enableRefund,
        haveRefunded,
        wallet: !!wallet,
        userProperties: !!userProperties,
      })

      return
    }

    checkSentReceived()
  }, [wallet, userStorage, claimAddress, tokenAddress])

  return [shouldRefund, refundAmount, claimAddress]
}

export default useRefund
