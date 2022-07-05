//@flow
/* eslint-disable */
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import WalletConnect from '@walletconnect/client'
// import { ISessionParams } from '@walletconnect/types'
import { NavigationContext } from '@react-navigation/core'
import web3Utils from 'web3-utils'

import logger from '../logger/js-logger'
import { useWallet } from './GoodWalletProvider'
import { useSessionApproveModal } from '../../components/walletconnect/WalletConnectModals'
const log = logger.child({ from: 'WalletConnectClient' })

//TODO:
//1. handle chains
//2. handle reconnect/go back without crash
//3. fetch method signature and params

/**
 * Parses the read WalletConnet URI from QR Code.
 * If not valid, returns null.
 * If valid, returns the WalletConnet URI.
 * @param {string} link - receive WalletConnect URI
 * @returns {string|null} - {link|null}
 */
export const readWalletConnectUri = link => {
  // checks that the link has the expected strings in it
  const eip1328UriFormat = /wc:[\w\d-]+@\d+\?bridge=.*&key=[a-z0-9]+/
  const validUri = link.match(eip1328UriFormat)[0]

  if (!validUri) {
    return null
  }

  return link
}

const sessionsCache = {}
// Create connector
export const useWalletConnectSession = () => {
  const [connector: WalletConnect, setConnector] = useState<WalletConnect>()
  // const [uri, setUri] = useState()
  const connectedUri = useRef()
  const wallet = useWallet()
  const navigation = useContext(NavigationContext)
  const { show: showApprove, isDialogShown } = useSessionApproveModal()

  const handleSessionRequest = useCallback(
    (session, connector) => {
      log.info('approving session:', { session })
      showApprove({
        walletAddress: wallet.account,
        session,
        modalType: 'connect',
        onApprove: () => {
          connectedUri.current = connector.uri
          connector.approveSession({ chainId: 1, accounts: [wallet.account] })
        },
        onReject: () => connector.rejectSession({ message: 'user declined' }),
      })
    },
    [showApprove, wallet],
  )

  const handleSignRequest = useCallback(
    (message, payload, connector) => {
      log.info('handleSignRequest', { message, payload })
      showApprove({
        walletAddress: wallet.account,
        message,
        payload,
        modalType: 'sign',
        onApprove: async () => {
          try {
            let result
            if (payload.method === 'eth_sign') {
              result = await wallet.sign(message)
            }

            if (payload.method === 'personal_sign') {
              result = await wallet.personalSign(message)
            }

            if (payload.method.includes('signTypedData')) {
              result = await wallet.signTypedData(message)
            }

            log.info('sign request approved:', { result })
            connector.approveRequest({ id: payload.id, result })
          } catch (e) {
            connector.rejectRequest({ error: e.message, id: payload.id })
            throw e
          }
        },
        onReject: () => connector.rejectRequest({ id: payload.id, error: 'user declined' }),
      })
    },
    [wallet, showApprove],
  )

  const handleTxRequest = useCallback(
    (message, payload, connector) => {
      log.info('handleTxRequest', { message, payload })
      showApprove({
        walletAddress: wallet.account,
        message,
        payload,
        modalType: 'tx',
        onApprove: async () => {
          try {
            let result
            if (payload.method === 'eth_signTransaction') {
              result = await wallet.signTransaction(message)
            }

            if (payload.method === 'eth_sendTransaction') {
              result = await wallet.sendRawTransaction(message)
            }

            log.info('tx success:', { result })
            connector.approveRequest({ id: payload.id, result })
          } catch (e) {
            connector.rejectRequest({ error: e.message, id: payload.id })
            throw e
          }
        },
        onReject: () => connector.rejectRequest({ id: payload.id, error: 'user declined' }),
      })
    },
    [wallet, showApprove],
  )

  const handleSessionDisconnect = useCalluack((session, connector) => {
    log.info('ending session:', { session })
    if (connectedUri.current) {
      sessionsCache[connectedUri.current] = undefined
    }
    setConnector(undefined)
    connector?.killSession()
  }, [])

  const connect = useCallback(
    uri => {
      log.debug('got uri:', { connectedUri, uri, wallet })
      if (connectedUri.current !== uri && uri && wallet) {
        log.debug('got uri creating connection:', { uri, wallet })

        let cachedConnector = sessionsCache[uri]
        if (!cachedConnector?.connected) {
          cachedConnector = undefined
        }
        const connector =
          cachedConnector ||
          new WalletConnect({
            // Required
            uri,

            // Required
            clientMeta: {
              description: 'GoodDollar Wallet App',
              url: 'https://wallet.gooddollar.org.org',
              icons: ['https://walletconnect.org/walletconnect-logo.png'],
              name: 'GoodDollar',
            },
          })

        sessionsCache[uri] = connector

        // Subscribe to session requests
        connector.on('session_request', (error, payload) => {
          log.debug('session:', { payload, error })
          if (error) {
            throw error
          }

          const sessionRequest: ISessionParams = payload.params[0]
          handleSessionRequest(sessionRequest, connector)
        })

        // Subscribe to call requests
        connector.on('call_request', (error, payload) => {
          const { method, params } = payload
          log.debug('call:', { payload, error, method, params })

          if (error) {
            throw error
          }

          try {
            let message
            if (payload.method === 'eth_sign') {
              message = payload?.params?.[1]
            }
            if (method === 'personal_sign') {
              message = payload?.params?.[0]
              log.debug('personal_sign:', { message })
              if (web3Utils.isHex(message)) {
                message = web3Utils.hexToUtf8(message)
                log.debug('personal_sign:', { message })
              }
            }
            if (payload.method.includes('eth_signTypedData')) {
              if (payload.params.length && payload.params[0]) {
                message = payload?.params?.[0] ?? null
                if (web3Utils.isAddress(payload?.params?.[0] ?? '')) {
                  message = payload?.params?.[1] ?? null
                }
              }
            }
            log.debug('sign message:', { message })
            if (message) {
              return handleSignRequest(message, payload, connector)
            }

            if (['eth_signTransaction', 'eth_sendTransaction'].includes(payload.method)) {
              const transaction = payload?.params?.[0] ?? null

              // // Backwards compatibility with param name change
              // if (transaction.gas && !transaction.gasLimit) {
              //   transaction.gasLimit = transaction.gas
              // }

              // We must pass a number through the bridge
              if (!transaction.gas) {
                transaction.gas = '8000000'
              }

              // Fallback for dapps sending no data
              if (!transaction.data) {
                transaction.data = '0x'
              }
              return handleTxRequest(transaction, payload, connector)
            }
          } catch (e) {
            log.warn('failed handling sign request', e.message, e, { payload })
            throw e
          }
        })

        connector.on('disconnect', (error, payload) => {
          log.debug('disconnect:', { payload, error })

          if (error) {
            throw error
          }
          handleSessionDisconnect(payload, connector)
        })

        setConnector(connector)
      }
    },
    [wallet, connectedUri, handleSessionDisconnect, handleSessionRequest, handleSignRequest],
  )

  // useEffect(() => {
  //   log.debug('connector changed', { connector, connectedUri })
  //   if (connectedUri.current !== connector?.uri && connector?.pending) {
  //     handleSessionRequest({})
  //   }
  // }, [connector, handleSessionRequest, connectedUri])

  return connect
}
