import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'

let isFirstCheckWeb3 = false
let needToBindEventsWeb3 = true

const log = logger.child({ from: 'useHasConnectionWeb3' })

export default () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const wallet = store.get('wallet')
  const connectionCheck = useRef()

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

    let next = setTimeout(() => {
      next = isWeb3Connection()
    }, 1000)

    return () => clearTimeout(next)
  })

  const killLastConnectionCheck = () => {
    if (typeof connectionCheck.current === 'function') {
      connectionCheck.current()
      connectionCheck.current = null
    }
  }

  const isWeb3Connection = useCallback(async () => {
    killLastConnectionCheck()

    if (!wallet || AppState.currentState !== 'active') {
      return
    }

    log.debug('isWeb3Connection', isConnection)

    if (!isFirstCheckWeb3) {
      isFirstCheckWeb3 = true
    }

    const isWalletConnected = wallet.wallet.currentProvider.connected

    if (!isWalletConnected) {
      return handleWalletNotConnected()
    }

    const isWalletAvailable = await wallet
      .balanceOf()
      .then(_ => true)
      .catch(_ => false)

    if (!isWalletAvailable) {
      return handleWalletNotConnected()
    }

    if (needToBindEventsWeb3) {
      bindEvents('add')
      needToBindEventsWeb3 = false
    }

    setIsConnection(true)
  })

  const web3Close = useCallback(() => {
    log.debug('web3 close')
    connectionCheck.current = isWeb3Connection()
  }, [])

  const web3Error = useCallback(() => {
    log.debug('web3 error')
    connectionCheck.current = isWeb3Connection()
  }, [])

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
        connectionCheck.current = isWeb3Connection()
      } else {
        killLastConnectionCheck()
      }
    }

    AppState.addEventListener('change', onAppStateChange)

    if (!isFirstCheckWeb3) {
      log.debug('web3 first')
      connectionCheck.current = isWeb3Connection()
    }

    return () => {
      killLastConnectionCheck()
      AppState.removeEventListener('change', onAppStateChange)
    }
  }, [isWeb3Connection, wallet])

  return isConnection
}
