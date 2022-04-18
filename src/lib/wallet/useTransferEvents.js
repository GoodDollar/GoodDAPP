// @flow
import { useCallback, useEffect, useRef } from 'react'
import logger from '../logger/js-logger'
import { ExceptionCategory } from '../exceptions/utils'
import userStorage from '../userStorage/UserStorage'
import useUserContext from '../hooks/useUserContext'
import useRealtimeProps from '../hooks/useRealtimeProps'
import goodWallet from './GoodWallet'

const log = logger.child({ from: 'useTransferEvents' })

/**
 * Starts listening to Transfer events to (and from) the current account
 */
const useTransferEvents = () => {
  const userContext = useUserContext()
  const subscriptionRef = useRef(null)
  const [getContext] = useRealtimeProps(userContext)

  const updateWalletStatus = useCallback(async () => {
    let walletOperations
    const { update, reset, ...account } = getContext()

    try {
      walletOperations = await Promise.all([goodWallet.balanceOf(), goodWallet.checkEntitlement()])
    } catch (exception) {
      const { message } = exception

      log.error('update balance and entitlement failed', message, exception, {
        category: ExceptionCategory.Blockhain,
      })
      return
    }

    try {
      const [balance, entitlement] = walletOperations
      const balanceChanged = !account.balance || account.balance !== balance
      const entitlementChanged = !account.entitlement || account.entitlement !== entitlement

      if (balanceChanged || entitlementChanged || account.ready === false) {
        update({ balance, entitlement, ready: true })
      }

      log.debug('updateAll done', { balance, entitlement })
    } catch (exception) {
      const { message } = exception

      log.warn('updateAll failed', `Store failed with exception: ${message}`, exception)
      return
    }
  }, [getContext])

  const initTransferEvents = useCallback(async () => {
    const subscribed = !!subscriptionRef.current

    if (subscriptionRef.current) {
      log.debug('skipping', { subscribed })
      return
    }

    await userStorage.ready

    const { userProperties } = userStorage
    const lastBlock = parseInt(userProperties.get('lastBlock') || 6400000)

    log.debug('starting events listener', { lastBlock, subscribed })

    goodWallet.watchEvents(lastBlock, toBlock => void userProperties.set('lastBlock', parseInt(toBlock)))
    subscriptionRef.current = goodWallet.balanceChanged(updateWalletStatus)
  }, [updateWalletStatus])

  useEffect(
    () => () => {
      const { current: subscription } = subscriptionRef

      if (subscription) {
        const { id, eventName } = subscription

        goodWallet.unsubscribeFromEvent({ eventName, id })
      }
    },
    [],
  )

  return [initTransferEvents, updateWalletStatus]
}

export default useTransferEvents
