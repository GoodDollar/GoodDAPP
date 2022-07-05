import { map, sum } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'
import Config from '../../../config/config'

const { enableRefund } = Config
const REFUNDED_FLAG = 'noRefundRequired'
const fromBlock = 17896430
const toBlock = 17913975
const claimAmount = 8210995

const useRefund = () => {
  const userStorage = useUserStorage()
  const [shouldRefund, setShouldRefund] = useState(undefined)
  const [refundAmount, setRefundAmount] = useState(0)

  const wallet = useWallet()
  const claimAddress = useMemo(() => wallet.UBIContract._address, [wallet])

  useEffect(() => {
    const { userProperties } = userStorage || {}

    const fetchAmounts = async (contract, event, filters) => {
      const events = await contract.getPastEvents(event, { ...filters, fromBlock })

      return map(events, 'returnValues.amount').map(Number)
    }

    const checkSentReceived = async () => {
      const { UBIContract, tokenContract, account } = wallet

      // request last claims, fetch amounts
      const claimFilters = { filter: { claimer: account }, toBlock }
      const claimAmounts = await fetchAmounts(UBIContract, 'UBIClaimed', claimFilters)

      // find max amount reached threshold
      const maxAmount = sum(claimAmounts.filter(amount => amount >= claimAmount)) || 0

      // if huge claim found - checking does the user already restored money back
      if (maxAmount) {
        const refundedFilters = { filter: { from: account, to: claimAddress } }
        const refundedAmounts = await fetchAmounts(tokenContract, 'Transfer', refundedFilters)
        const totalRefunded = sum(refundedAmounts) || 0
        const debt = maxAmount - totalRefunded

        if (debt > 0) {
          setShouldRefund(true)
          setRefundAmount(debt)
          return
        }
      }

      setShouldRefund(false)
      userProperties.setLocal(REFUNDED_FLAG, true)
    }

    if (!enableRefund || !userProperties || !wallet || !claimAddress || userProperties.getLocal(REFUNDED_FLAG)) {
      return
    }

    checkSentReceived()
  }, [wallet, claimAddress, userStorage])

  return [shouldRefund, refundAmount, claimAddress]
}

export default useRefund
