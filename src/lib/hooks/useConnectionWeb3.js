import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'

let isFirstCheckWeb3 = false
let needToBindEventsWeb3 = true

const log = logger.child({ from: 'useHasConnectionWeb3' })

export default () => {
  const [isConnection, setIsConnection] = useState(false)
  const store = SimpleStore.useStore()
  const wallet = store.get('wallet')
  const connectionCheck = useRef()

  /**
   * It's called by isWeb3Connection when connection fails.
   * Saves a function to kill the recursion into connectionCheck
   */
  const handleWalletNotConnected = useCallback(() => {
    log.debug('isWeb3Connection not connected')

    //if not connected and not reconnecting than try to force reconnect
    if (wallet.wallet.currentProvider.reconnecting === false) {
      log.debug('isWeb3Connection forcing reconnect')
      wallet.wallet.currentProvider.reconnect()
    }

    setIsConnection(false)

    if (!needToBindEventsWeb3) {
      needToBindEventsWeb3 = true
      bindEvents('remove')
    }

    /**
     * Tries to connect again and saves the id of the timer
     * returned by setTimeout so it can be cleared.
     */
    let next = setTimeout(isWeb3Connection, 1000)

    /**
     * Saves the clear function into connectionCheck.current
     */
    connectionCheck.current = () => clearTimeout(next)
  }, [wallet])

  /**
   * Kills the last connection listener alive.
   */
  const killLastConnectionCheck = () => {
    if (typeof connectionCheck.current === 'function') {
      connectionCheck.current()
      connectionCheck.current = null
    }
  }

  /**
   * When connection fails, it calls handleWalletNotConnected which handles the failure
   * and then calls this function again to re-try the connection.
   */
  const isWeb3Connection = useCallback(async () => {
    killLastConnectionCheck()

    /**
     * Nothing to do if the app is in background
     */
    if (!wallet || AppState.currentState !== 'active') {
      return
    }

    log.debug('isWeb3Connection', isConnection)

    if (!isFirstCheckWeb3) {
      isFirstCheckWeb3 = true
    }

    const isWalletConnected = wallet.wallet.currentProvider.connected

    if (!isWalletConnected) {
      handleWalletNotConnected()
    }

    const isWalletAvailable = await wallet
      .balanceOf()
      .then(_ => true)
      .catch(_ => false)

    if (!isWalletAvailable) {
      handleWalletNotConnected()
    }

    if (needToBindEventsWeb3) {
      bindEvents('add')
      needToBindEventsWeb3 = false
    }

    setIsConnection(true)
  }, [wallet, AppState.currentState, handleWalletNotConnected])

  const web3Close = useCallback(() => {
    log.debug('web3 close')
    isWeb3Connection()
  }, [isWeb3Connection])

  const web3Error = useCallback(() => {
    log.debug('web3 error')
    isWeb3Connection()
  }, [isWeb3Connection])

  const bindEvents = method => {
    log.debug('web3 binding listeners')
    const callMethod = method === 'remove' ? 'off' : 'on'
    wallet.wallet.currentProvider[callMethod]('close', web3Close)
    wallet.wallet.currentProvider[callMethod]('error', web3Error)
  }

  useEffect(() => {
    if (!wallet) {
      return
    }

    const onAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        log.debug('web3 appstate')
        isWeb3Connection()
      } else {
        /**
         * Kill the last listener if the app is dismissed
         */
        killLastConnectionCheck()
      }
    }

    AppState.addEventListener('change', onAppStateChange)

    if (!isFirstCheckWeb3) {
      log.debug('web3 first')
      isWeb3Connection()
    }

    /**
     * Returns an unsubscribe function to kill the listeners when the effect dies
     */
    return () => {
      killLastConnectionCheck()
      AppState.removeEventListener('change', onAppStateChange)
    }
  }, [isWeb3Connection, wallet])

  return isConnection
}
