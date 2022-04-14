// @flow
import { useCallback, useEffect, useRef } from 'react'
import logger from '../logger/js-logger'
import { ExceptionCategory } from '../exceptions/utils'
import userStorage from '../userStorage/UserStorage'
import useUserContext from '../hooks/useUserContext'
import goodWallet from './GoodWallet'

const log = logger.child({ from: 'useTransferEvents' })

/**
 * Starts listening to Transfer events to (and from) the current account
 */
const useTransferEvents = () => {
  const userContext = useUserContext()
  const subscriptionRef = useRef(null)
  const userContextRef = useRef(userContext)

  const updateWalletStatus = useCallback(async () => {
    let walletOperations
    const { update, reset, ...account } = userContextRef.current

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
  }, [])

  const initTransferEvents = useCallback(async () => {
    const isUserStorageReady = await userStorage.ready

    if (isUserStorageReady) {
      const lastBlock = parseInt(userStorage.userProperties.get('lastBlock') || 6400000)

      log.debug('starting events listener', { lastBlock, subscribed: !!subscriptionRef.current })

      if (subscriptionRef.current) {
        return
      }

      goodWallet.watchEvents(lastBlock, toBlock => {
        userStorage.userProperties.set('lastBlock', parseInt(toBlock))
      })

      subscriptionRef.current = goodWallet.balanceChanged(updateWalletStatus)
    }
  }, [updateWalletStatus])

  useEffect(() => {
    userContextRef.current = userContext
  }, [userContext])

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
