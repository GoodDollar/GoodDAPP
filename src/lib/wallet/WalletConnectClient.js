//@flow
import { useCallback, useEffect, useState } from 'react'
import WalletConnect from '@walletconnect/client'
import web3Utils from 'web3-utils'
import abiDecoder from 'abi-decoder'
import Web3 from 'web3'
import { first, maxBy, sortBy } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import { delay } from '../utils/async'
import api from '../../lib/API/api'
import logger from '../logger/js-logger'
import { useSessionApproveModal } from '../../components/walletconnect/WalletConnectModals'
import Config from '../../config/config'
import { useWallet } from './GoodWalletProvider'
const log = logger.child({ from: 'WalletConnectClient' })

// TODO:
// 7. cancel tx
// 8. edit gas
// 9. advanced edit tx values/contract call values
// 10. events
// 11. show warning if unable to decode contract call
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
  const validUri = first(link.match(eip1328UriFormat))

  if (!validUri) {
    return null
  }

  return link
}

export const getWalletConnectTopic = link => {
  const eip1328UriFormat = /wc:([\w\d-]+)@\d+\?bridge=.*&key=[a-z0-9]+/
  const topic = link.match(eip1328UriFormat)[1]
  return topic
}

let chainsCache = []

export const useChainsList = () => {
  const [chains, setChains] = useState(chainsCache)
  chainsCache = chains

  useEffect(() => {
    if (chainsCache.length) {
      return
    }

    api.getChains().then(data => {
      setChains(sortBy(data, 'name'))
    })
  }, [setChains])

  return chains
}

const cachedWeb3 = {}
const getWeb3 = rpc => {
  const web3 = cachedWeb3[rpc]
  if (web3) {
    return web3
  }

  const tempWeb3 = new Web3(new Web3.providers.HttpProvider(rpc))

  cachedWeb3[rpc] = tempWeb3
  return tempWeb3
}

const getChainRpc = chainDetails => {
  return first((chainDetails.rpc || chainDetails.rpcUrls).filter(_ => _.includes('${') === false))
}

// Create connector
let cachedConnector
export const useWalletConnectSession = () => {
  const [activeConnector, setConnector] = useState()
  const [chain, setChain] = useState()
  const [pendingTxs, setPending] = useState([])
  const [chainPendingTxs, setChainPendingTxs] = useState([])

  const wallet = useWallet()
  const { show: showApprove } = useSessionApproveModal()
  const chains = useChainsList()

  const decodeTx = useCallback(
    async (connector, tx, explorer, web3) => {
      log.info('decodetx:', { tx, chain, connector, explorer })
      if (tx.data !== '0x' && explorer) {
        log.info('fetching contract data', { chain, explorer, contract: tx.to })
        const result = await api.getContractAbi(tx.to, explorer)
        log.info('got contract data', { result })
        if (!result) {
          return {}
        }
        const abi = JSON.parse(result)
        abiDecoder.addABI(abi)
        const decoded = abiDecoder.decodeMethod(tx.data)
        log.info('decoded:', { decoded })

        return { decoded }
      }
    },
    [chain, wallet],
  )

  const handleSessionRequest = useCallback(
    (connector, payload) => {
      const session = connector.session
      log.info('approving session:', { session, payload })
      let requestedChainId = Number(payload?.params?.[0]?.chainId)

      //we support requests only for fuse or celo
      requestedChainId = [42220, 122].includes(requestedChainId) ? requestedChainId : Number(Config.networkId)
      const chainDetails = chains.find(_ => Number(_.chainId) === requestedChainId)

      showApprove({
        walletAddress: wallet.account,
        session,
        modalType: 'connect',
        onApprove: () => {
          //we support
          connector.approveSession({
            chainId: requestedChainId,
            accounts: [wallet.account],
          })
          switchChain(chainDetails)
        },
        onReject: () => connector.rejectSession({ message: 'USER_DECLINE' }),
      })
    },
    [showApprove, wallet],
  )

  const handleSignRequest = useCallback(
    (message, payload, connector) => {
      log.info('handleSignRequest', { message, payload, session: connector.session })
      showApprove({
        walletAddress: wallet.account,
        session: connector.session,
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
        onReject: () => connector.rejectRequest({ id: payload.id, error: 'USER_DECLINE' }),
      })
    },
    [wallet, showApprove],
  )

  const handleTxRequest = useCallback(
    async (message, payload, connector) => {
      const chainDetails = chain || chains.find(_ => Number(_.chainId) === Number(connector.session?.chainId))
      const web3 = getWeb3(getChainRpc(chainDetails))

      let explorer = first(chainDetails.explorers)?.url

      log.info('handleTxRequest', { message, payload, connector, chainDetails })
      const [decodedTx, balance] = await Promise.all([
        decodeTx(connector, message, explorer, web3),
        web3.eth.getBalance(wallet.account),
      ])

      let error
      let estimatedGas
      try {
        estimatedGas = await web3.eth.estimateGas(message)
      } catch (e) {
        error = e.message
      }
      log.info('validateCall', { error, estimatedGas })

      // We must pass a number through the bridge
      if (!message.gas) {
        message.gas = estimatedGas || String(Config.defaultTxGas)
      }

      const eip1599Gas = () => Number(message.maxFeeParGas) + Number(message.maxPriorityFeePerGas)
      const gasRequired = Number(message.gas) * (message.gasPrice ? Number(message.gasPrice) : eip1599Gas())
      const gasStatus = { balance, hasEnoughGas: balance >= gasRequired, gasRequired }
      showApprove({
        walletAddress: wallet.account,
        session: connector.session,
        message: { ...message, error, decodedTx, gasStatus, gasRequired },
        payload,
        modalType: 'tx',
        explorer,
        onApprove: async () => {
          try {
            if (payload.method === 'eth_signTransaction') {
              const result = await wallet.signTransaction(message)
              log.info('tx sign success:', { result })
              connector.approveRequest({ id: payload.id, result })
            }

            if (payload.method === 'eth_sendTransaction') {
              return sendTx(message, payload, web3, chainDetails, connector)
            }
          } catch (e) {
            connector.rejectRequest({ error: e.message, id: payload.id })
            throw e
          }
        },
        onReject: () => connector.rejectRequest({ id: payload.id, error: 'USER_DECLINE' }),
      })
    },
    [wallet, chain, chains, showApprove, decodeTx],
  )

  const handleScanRequest = useCallback(
    (payload, connector) => {
      log.info('handleScanRequest', { payload })
      showApprove({
        walletAddress: wallet.account,
        session: connector.session,
        modalType: 'scan',
        onApprove: data => {
          let result = data
          if (payload?.params?.[0]) {
            const regex = new RegExp(payload?.params?.[0])
            result = first(regex.exec(data))
          }
          log.debug('scan result:', { result, data, payload })
          if (result) {
            connector.approveRequest({ id: payload.id, result })
            return true
          }
          connector.rejectSession({ id: payload.id, message: 'NO_REGEX_MATCH', result })
          return false
        },
        onReject: () => connector.rejectRequest({ id: payload.id, error: 'USER_DECLINE' }),
      })
    },
    [showApprove],
  )

  const switchChain = useCallback(
    async chain => {
      log.debug('switching chain...', { chain })

      await activeConnector.updateSession({
        chainId: Number(chain.chainId),
        accounts: [wallet.account],
        rpcUrl: getChainRpc(chain),
      })
      setChain(chain)
      AsyncStorage.setItem('walletconnect_requestedChain', chain.chainId)
    },
    [activeConnector, wallet],
  )

  const handleSwitchChainRequest = useCallback(
    (payload, connector) => {
      log.info('handleSwitchChainRequest', { payload })
      const chain = payload.params[0]
      const chainDetails = chains.find(_ => Number(_.chainId) === Number(chain.chainId))
      showApprove({
        walletAddress: wallet.account,
        session: connector.session,
        modalType: 'switchchain',
        message: `${chain.name || chainDetails.name || chain.chainId}: ${getChainRpc(chain)}`,
        onApprove: () => {
          chain.explorers = chain.blockExplorerUrls
          switchChain(chain)
        },
        onReject: () => connector.rejectRequest({ id: payload.id, error: 'USER_DECLINE' }),
      })
    },
    [showApprove, chains, switchChain],
  )

  const handleSessionDisconnect = useCallback(
    async connector => {
      const session = connector?.session
      log.info('ending session:', { session })
      connector?.killSession({ message: 'USER_TERMINATED' }).catch()
      setConnector(undefined)
      AsyncStorage.removeItem('walletconnect')
      AsyncStorage.removeItem('walletconnect_requestedChain')

      await delay(500)
    },
    [setConnector],
  )

  const handleUnsupportedRequest = useCallback(
    (payload, connector) => {
      const session = connector.session
      showApprove({
        walletAddress: wallet.account,
        payload,
        session,
        modalType: 'error',
      })
      connector.rejectRequest({ error: 'METHOD_NOT_SUPPORTED', id: payload.id })
    },
    [wallet],
  )

  const connect = useCallback(
    (uriOrSession, chainId) => {
      if (wallet) {
        const session = typeof uriOrSession === 'string' ? undefined : uriOrSession
        const uri = typeof uriOrSession === 'string' ? uriOrSession : undefined
        log.debug('got uri:', { uri, session, wallet })

        let connector = new WalletConnect({
          // Required
          uri,
          session,

          // Required
          clientMeta: {
            description: 'GoodDollar Wallet App',
            url: 'https://wallet.gooddollar.org.org',
            icons: [
              'https://wallet.gooddollar.org/favicon-96x96.png',
              'https://wallet.gooddollar.org/favicon-32x32.png',
              'https://wallet.gooddollar.org/favicon.ico',
            ],
            name: 'GoodDollar',
          },
        })
        log.debug('got uri created connection:', { uri, session, wallet, connector })

        if (connector.pending && !connector.connected) {
          handleSessionRequest(connector, { params: [{ chainId }] })
        }

        setConnector(connector)

        return connector
      }
    },
    [
      wallet,
      activeConnector,
      handleSessionDisconnect,
      handleSessionRequest,
      handleSignRequest,
      handleTxRequest,
      handleSwitchChainRequest,
      handleUnsupportedRequest,
      handleScanRequest,
    ],
  )

  const sendTx = useCallback(
    async (params, payload, web3, chainDetails, connector) => {
      const nonce = await web3.eth.getTransactionCount(wallet.account)
      let txHash
      const onTransactionHash = result => {
        txHash = result
        log.info('tx send success:', { result })
        payload?.id && connector.approveRequest({ id: payload.id, result })
        const txData = {
          txHash,
          params,
          nonce,
          chainId: chainDetails.chainId,
        }
        setPending([...pendingTxs, txData])
        AsyncStorage.setItem(`GD_WALLETCONNECT_PENDING_${result}`, txData)
      }

      const onReceipt = result => {
        log.info('tx receipt:', { result })
        const toRemove = pendingTxs.filter(_ => _.chainId === chainDetails.chainId && _.nonce <= nonce)
        toRemove.forEach(_ => AsyncStorage.removeItem(`GD_WALLETCONNECT_PENDING_${_.txHash}`))
        setPending(pendingTxs.filter(_ => !toRemove.includes(_))) //remove expired txs
      }

      const onError = e => {
        log.info('tx error:', { e })
        setPending(pendingTxs.filter(_ => _.txHash !== txHash))
        connector.rejectRequest({ error: e.message, id: payload.id })
        txHash && AsyncStorage.removeItem(`GD_WALLETCONNECT_PENDING_${txHash}`)
      }
      const txPromisEvent = wallet.sendRawTransaction(params, web3, { onError, onReceipt, onTransactionHash })
      return txPromisEvent
    },
    [wallet, setPending, pendingTxs],
  )

  const cancelTx = useCallback(async () => {
    const web3 = getWeb3(getChainRpc(chain))
    const minGasPrice = await web3.eth.getGasPrice()
    const { params } = maxBy(chainPendingTxs, _ => Number(_.params?.gasPrice || _.params?.maxFeeParGas))
    const gasPrice = Math.max(Number(minGasPrice), Number(params.gasPrice || params.maxFeeParGas) * 1.1).toFixed(0)
    return sendTx(
      { from: wallet.account, to: wallet.account, gasPrice, value: 0, gas: 21000 },
      {},
      web3,
      chain,
      activeConnector,
    )
  }, [sendTx, chain, activeConnector, chainPendingTxs])

  useEffect(() => {
    if (!activeConnector) {
      return
    }

    const connector = activeConnector

    const unsubscrube = () => {
      connector.off('disconnect')
      connector.off('call_request')
      connector.off('session_request')
    }

    // since connector is cached it could an already existing one, so we clear the subscriptions
    unsubscrube()

    // Subscribe to session requests
    connector.on('session_request', (error, payload) => {
      log.debug('session:', { payload, error })
      if (error) {
        throw error
      }

      handleSessionRequest(connector, payload)
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

          // Fallback for dapps sending no data
          if (!transaction.data) {
            transaction.data = '0x'
          }
          if (!transaction.value) {
            transaction.value = '0x0'
          }

          if (!transaction.gas && transaction.gasLimit) {
            transaction.gas = transaction.gasLimit
          }

          return handleTxRequest(transaction, payload, connector)
        }

        if (['wallet_addEthereumChain', 'wallet_switchEthereumChain'].includes(payload.method)) {
          return handleSwitchChainRequest(payload, connector)
        }

        if (payload.method === 'wallet_scanQrCode') {
          return handleScanRequest(payload, connector)
        }

        handleUnsupportedRequest(payload, connector)
        throw new Error(`Unsupported request: ${payload.method}`)
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

      handleSessionDisconnect(connector)
    })

    // DO NOT STOP SUBSCRIPTIONS ON UNMOUNT, so user sees incoming requests even when in other screens
    // return unsubscrube
  }, [
    wallet,
    activeConnector,
    chain,
    chains,
    handleSessionDisconnect,
    handleSessionRequest,
    handleSignRequest,
    handleTxRequest,
    handleSwitchChainRequest,
    handleUnsupportedRequest,
    handleScanRequest,
  ])

  const disconnect = useCallback(() => {
    if (activeConnector) {
      handleSessionDisconnect(activeConnector)
    }
  }, [activeConnector, handleSessionDisconnect])

  const reconnect = useCallback(async () => {
    if (!activeConnector) {
      const session = await AsyncStorage.getItem('walletconnect')
      const chainId = await AsyncStorage.getItem('walletconnect_requestedChain')

      if (session) {
        connect(
          session,
          chainId,
        )
      }
    }
  }, [connect, activeConnector, chains])

  const loadPendingTxs = async () => {
    const txKeys = (await AsyncStorage.getAllKeys()).filter(_ => _.startsWith('GD_WALLETCONNECT_PENDING_'))
    const txs = (await AsyncStorage.multiGet(txKeys)).map(_ => _[1])
    setPending(txs)
  }

  useEffect(() => {
    loadPendingTxs()
    if (cachedConnector) {
      log.info('cachedConnector exists not reconnecting')
      return setConnector(cachedConnector)
    }

    reconnect()
  }, [])

  useEffect(() => {
    cachedConnector = activeConnector
    const chainDetails = chains.find(_ => Number(_.chainId) === Number(activeConnector?.session?.chainId))
    log.debug('setting chain:', { chainDetails })
    setChain(chainDetails)

    /**
    if (activeConnector && chains.length > 0) {
    const payload = {
      id: 1657446841779151,
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0x1379510d8b1dd389d4cf1b9c6c3c8cc3136d8e56',
          to: '0xe3f85aad0c8dd7337427b9df5d0fb741d65eeeb5',
          gasPrice: 1e9,
          gas: '0x3b90d',
          value: '0x2d79883d2000',
          data:
            '0x7ff36ab5000000000000000000000000000000000000000000000000003221e606b24f2900000000000000000000000000000000000000000000000000000000000000800000000000000000000000001379510d8b1dd389d4cf1b9c6c3c8cc3136d8e560000000000000000000000000000000000000000000000000000000062caa66500000000000000000000000000000000000000000000000000000000000000030000000000000000000000000be9e53fd7edac9f859882afdda116645287c629000000000000000000000000620fd5fa44be6af63715ef4e65ddfa0387ad13f500000000000000000000000034ef2cc892a88415e9f02b91bfa9c91fc0be6bd4',
        },
      ],
    }
    handleTxRequest(payload.params[0], payload, activeConnector)
    const payload = {
      id: 1657446841779151,
      jsonrpc: '2.0',
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x' + (122).toString(16),
          chainName: 'fuse',
          nativeCurrency: {
            name: 'Fuse',
            symbol: 'fuse',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.fuse.io'],
          blockExplorerUrls: ['https://explorer.fuse.io'],
          iconUrls: [],
        },
      ],
    }
    // handleSwitchChainRequest(payload, activeConnector)
    handleUnsupportedRequest(payload, activeConnector)
    }
    **/
  }, [activeConnector, chains, setChain, handleTxRequest])

  useEffect(() => {
    ;(async () => {
      if (chain && pendingTxs) {
        const web3 = getWeb3(getChainRpc(chain))
        const curNonce = await web3.eth.getTransactionCount(wallet.account)
        const stillPending = pendingTxs.filter(_ => _.chainId === chain.chainId && _.nonce === curNonce)
        setChainPendingTxs(stillPending)
      }
    })()
  }, [pendingTxs, chain, wallet, setChainPendingTxs])

  return {
    wcConnect: connect,
    wcConnected: activeConnector?.connected,
    wcSession: activeConnector?.session,
    wcDisconnect: disconnect,
    wcSwitchChain: switchChain,
    wcChain: chain,
    chainPendingTxs,
    cancelTx,
  }
}
