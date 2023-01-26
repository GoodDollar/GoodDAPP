/* eslint-disable*/
//@flow
import { useCallback, useEffect, useState } from 'react'
import WalletConnect from '@walletconnect/client'
import web3Utils from 'web3-utils'
import abiDecoder from 'abi-decoder'
import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { parseUri, getSdkError } from '@walletconnect/utils'

import Web3 from 'web3'
import { first, last, maxBy, sortBy, sample } from 'lodash'
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
  try {
    const { version } = parseUri(link)
    if (version !== 1 && version !== 2) {
      return null
    }

    return link
  } catch (e) {
    console.log(e)
    return null
  }
}

export const getWalletConnectTopic = link => {
  const eip1328UriFormat = /wc:([\w\d-]+)@\d+\?bridge=.*&key=[a-z0-9]+/
  const topic = link.match(eip1328UriFormat)[1]
  return topic
}

let chainsCache = []
const highlights = [122, 42220, 1, 100, 56, 137, 42161, 43114, 10, 250, 25, 2222, 8217, 1284, 1666600000]
export const useChainsList = () => {
  const [chains, setChains] = useState(chainsCache)
  chainsCache = chains

  useEffect(() => {
    if (chainsCache.length) {
      return
    }

    api.getChains().then(data => {
      const testnets = data.filter(_ => _.name.toLowerCase().includes('test'))
      const mainnets = data.filter(
        _ => _.name.toLowerCase().includes('test') === false && highlights.includes(_.chainId) === false,
      )
      const main = sortBy(data.filter(_ => highlights.includes(_.chainId)), _ => highlights.indexOf(_.chainId))
      const final = main.concat(sortBy(mainnets, 'name'), sortBy(testnets, 'name'))
      setChains(final)
    })
  }, [setChains])

  return chains
}

const cachedWeb3 = {}
const getWeb3 = async (chainDetails, retry = 5) => {
  const rpc = getChainRpc(chainDetails)
  const web3 = cachedWeb3[rpc]
  if (web3 || retry === 0) {
    log.debug('found working rpc:', { rpc, chainDetails, retry })
    return web3
  }

  try {
    const tempWeb3 = new Web3(new Web3.providers.HttpProvider(rpc))
    const testBlock = await tempWeb3.eth.getBlockNumber()
    if (testBlock > 0) {
      //stop at 0 retries
      log.debug('found working rpc:', { rpc, chainDetails, retry })
      cachedWeb3[rpc] = tempWeb3
      return tempWeb3
    }
  } catch (e) {}
  log.warn('web3 not responding retrying another random rpc...', { rpc, chainDetails })
  return await getWeb3(chainDetails, retry - 1)
}

const getChainRpc = chainDetails => {
  const rpc = sample((chainDetails.rpc || chainDetails.rpcUrls).filter(_ => _.startsWith('https')))
  return rpc.replace('${INFURA_API_KEY}', Config.infuraKey)
}

let cachedV2Connector
const useV2Connector = () => {
  const [initialized, setInitialized] = useState(false || cachedV2Connector)

  const onInitialize = useCallback(async () => {
    try {
      const core = new Core({
        projectId: '2d923a8a66e396445ba00cd8b882450b',
      })

      cachedV2Connector = await Web3Wallet.init({
        logger: 'debug',
        core, // <- pass the shared `core` instance
        metadata: {
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
      log.debug('initialized wc v2', cachedV2Connector.respondSessionRequest)
      setInitialized(true)
    } catch (err) {
      log.error('failed initializing wc v2', err, err.message)
    }
  }, [])

  useEffect(() => {
    if (!initialized) {
      onInitialize()
    }
  }, [initialized, onInitialize])

  return initialized
}

// Create connector
let cachedConnector
export const useWalletConnectSession = () => {
  const isInitialized = useV2Connector()
  const [activeConnector, setConnector] = useState()
  const [v2session, setSession] = useState()

  const [chain, setChain] = useState()
  const [pendingTxs, setPending] = useState([])
  const [chainPendingTxs, setChainPendingTxs] = useState([])

  const wallet = useWallet()
  const { show: showApprove, isDialogShown } = useSessionApproveModal()
  const chains = useChainsList()

  const decodeTx = useCallback(
    async (tx, explorer, web3) => {
      log.info('decodetx:', { tx, chain, explorer })
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

  const rejectRequest = useCallback(async (connector, id, topic, error) => {
    const isV2 = connector === cachedV2Connector
    if (isV2) {
      connector.respondSessionRequest({
        topic,
        response: { id, jsonrpc: '2.0', error: error || getSdkError('USER_REJECTED').message },
      })
    } else {
      connector.rejectRequest({ id, error: error || getSdkError('USER_REJECTED').message })
    }
  }, [])

  const approveRequest = useCallback(async (connector, id, topic, result) => {
    const isV2 = connector === cachedV2Connector
    if (isV2) {
      connector.respondSessionRequest({
        topic,
        response: { id, jsonrpc: '2.0', result },
      })
    } else {
      connector.approveRequest({ id: payload.id, result })
    }
  }, [])

  const getV2Meta = payload => {
    const {
      topic,
      params: { chainId },
    } = payload
    const sessionv2 = cachedV2Connector.getActiveSessions()[topic]
    let requestedChainIdV2 = Number(
      (chainId || sessionv2?.namespaces?.eip155?.chains?.[0] || `:${Config.networkId}`).split(':')[1],
    )
    if (sessionv2) {
      return {
        ...sessionv2.peer.metadata,
        topic,
        chainId: requestedChainIdV2,
      }
    }
    return
  }

  const getMethodAndParams = payload => {
    const { method, params } = payload?.params?.request || payload
    return { method, params }
  }

  const handleSessionRequest = useCallback(
    (connector, payload) => {
      const isV2 = connector === cachedV2Connector
      const session = connector.session
      const metadata = payload?.params?.[0]?.peerMeta || payload?.params?.proposer?.metadata
      let requestedChainIdV1 = Number(payload?.params?.[0]?.chainId)
      let requestedChainIdV2 = Number(
        (payload?.params?.requiredNamespaces?.eip155?.chains?.[0] || `:${Config.networkId}`).split(':')[1],
      )
      let requestedChainId = requestedChainIdV1 || requestedChainIdV2 || Number(Config.networkId)
      const appUrl = metadata.url
      if (appUrl.includes('voltage.finance')) {
        // bug in voltage chainid request
        requestedChainId = 122
      }

      // requestedChainId = [42220, 122].includes(requestedChainId) ? requestedChainId :
      const chainDetails = chains.find(_ => Number(_.chainId) === requestedChainId)
      log.info('approving session:', { session, payload, metadata, requestedChainId, chainDetails })

      showApprove({
        walletAddress: wallet.account,
        payload,
        requestedChainId,
        metadata,
        modalType: 'connect',
        onApprove: async () => {
          if (isV2) {
            const eip155Chains = payload?.params?.requiredNamespaces?.eip155?.chains
            const response = {
              id: payload.id,
              namespaces: {
                eip155: {
                  chains: eip155Chains,
                  accounts: eip155Chains.map(c => `${c}:${wallet.account}`),
                  methods: [
                    'eth_sendTransaction',
                    'eth_signTransaction',
                    'eth_sign',
                    'personal_sign',
                    'eth_signTypedData',
                    'wallet_addEthereumChain',
                    'wallet_switchEthereumChain',
                    'wallet_scanQrCode',
                  ],
                  events: ['accountsChanged', 'chainChanged'],
                },
              },
            }
            const sessionv2 = await cachedV2Connector.approveSession(response)
            log.debug('v2 approveSession result:', sessionv2, { response, isV2 })
            setV2Session(sessionv2)
          } else {
            connector.approveSession({
              chainId: requestedChainId,
              accounts: [wallet.account],
            })
            switchChain(chainDetails)
          }
        },
        onReject: () => {
          if (isV2) {
            connector.rejectSession({
              proposerPublicKey: payload?.params?.peer.publicKey,
              reason: getSdkError('USER_REJECTED'),
            })
          }
          {
            connector.rejectSession({ message: 'USER_DECLINE' })
          }
        },
      })
    },
    [showApprove, wallet, chains, setConnector, setV2Session],
  )

  const handleSignRequest = useCallback(
    (message, payload, connector) => {
      const { method } = getMethodAndParams(payload)
      const v2meta = getV2Meta(payload)
      const metadata = v2meta || connector?.session?.peerMeta
      log.info('handleSignRequest', { message, method, payload, metadata })
      showApprove({
        walletAddress: wallet.account,
        metadata,
        message,
        payload: { method },
        modalType: 'sign',
        onApprove: async () => {
          try {
            let result
            if (method === 'eth_sign') {
              result = await wallet.sign(message)
            }

            if (method === 'personal_sign') {
              result = await wallet.personalSign(message)
            }

            if (method.includes('signTypedData')) {
              result = await wallet.signTypedData(message)
            }

            log.info('sign request approved:', { result })
            approveRequest(connector, payload.id, payload.topic, result)
          } catch (e) {
            rejectRequest(connector, payload.id, payload.topic, e.message)
            throw e
          }
        },
        onReject: () => rejectRequest(connector, payload.id, payload.topic),
      })
    },
    [wallet, showApprove, approveRequest, rejectRequest],
  )

  const handleTxRequest = useCallback(
    async (message, payload, connector) => {
      const { method, params } = getMethodAndParams(payload)
      const v2meta = getV2Meta(payload)
      const metadata = connector?.session?.peerMeta || v2meta
      const requestedChainId = Number(v2meta?.chainId || connector.session?.chainId)
      //handle v2 per request chain
      const chainDetails = v2meta?.chainId || !chain ? chains.find(_ => Number(_.chainId) === requestedChainId) : chain
      const web3 = await getWeb3(chainDetails)

      let explorer = first(chainDetails.explorers)?.url

      log.info('handleTxRequest', { message, method, params, metadata, connector, chainDetails })

      const [decodedTx, balance] = await Promise.all([
        decodeTx(message, explorer, web3),
        web3.eth.getBalance(wallet.account),
      ])

      let error
      let estimatedGast
      try {
        estimatedGas = await web3.eth.estimateGas(message)
      } catch (e) {
        error = e.message
      }
      log.info('validateCall', { error, estimatedGas, web3 })

      // We must pass a number through the bridge
      if (!message.gas) {
        message.gas = estimatedGas || String(Config.defaultTxGas)
      }

      const eip1599Gas = () => Number(message.maxFeeParGas) + Number(message.maxPriorityFeePerGas)
      const gasRequired = Number(message.gas) * (message.gasPrice ? Number(message.gasPrice) : eip1599Gas())
      const gasStatus = { balance, hasEnoughGas: balance >= gasRequired, gasRequired }
      showApprove({
        walletAddress: wallet.account,
        metadata,
        message: { ...message, error, decodedTx, gasStatus, gasRequired },
        payload: { method },
        modalType: 'tx',
        explorer,
        onApprove: async () => {
          try {
            if (method === 'eth_signTransaction') {
              const result = await wallet.signTransaction(message)
              log.info('tx sign success:', { result })
              approveRequest(connector, payload.id, payload.topic, result)
            }

            if (method === 'eth_sendTransaction') {
              return sendTx(message, payload, web3, chainDetails, connector)
            }
          } catch (e) {
            rejectRequest(connector, payload.id, payload.topic, e.message)
            throw e
          }
        },
        onReject: () => rejectRequest(connector, payload.id, payload.topic),
      })
    },
    [wallet, chain, chains, showApprove, decodeTx],
  )

  const handleScanRequest = useCallback(
    (payload, connector) => {
      log.info('handleScanRequest', { payload })
      const v2meta = getV2Meta(payload)
      const metadata = v2meta || connector?.session?.peerMeta
      showApprove({
        walletAddress: wallet.account,
        metadata,
        modalType: 'scan',
        onApprove: data => {
          let result = data
          if (payload?.params?.[0]) {
            const regex = new RegExp(payload?.params?.[0])
            result = first(regex.exec(data))
          }
          log.debug('scan result:', { result, data, payload })
          if (result) {
            approveRequest(connector, payload.id, payload.topic, result)
            return true
          }
          rejectSession(connector, payload.id, payload.topic, 'NO_REGEX_MATCH')
          return false
        },
        onReject: () => rejectSession(connector, payload.id, payload.topic),
      })
    },
    [showApprove],
  )

  const switchChain = useCallback(
    async chain => {
      log.debug('switching chain...', { chain, activeConnector })
      if (!activeConnector) {
        return
      }
      // for wc v1 only
      if (activeConnector === cachedConnector) {
        await activeConnector.updateSession({
          chainId: Number(chain.chainId),
          accounts: [wallet.account],
          rpcUrl: getChainRpc(chain),
        })
        AsyncStorage.setItem('walletconnect_requestedChain', chain.chainId)
      } else {
        await cachedV2Connector.emitSessionEvent({
          topic: v2session.topic,
          event: { name: 'chainChanged', data: `eip155:${chain.chainId}` },
          chainId: `eip155:${v2session.chainId}`,
        })
        AsyncStorage.setItem('walletconnect_requestedChain_v2', chain.chainId)
      }
      setChain(chain)
    },
    [activeConnector, wallet, v2session],
  )

  const handleSwitchChainRequest = useCallback(
    (payload, connector) => {
      log.info('handleSwitchChainRequest', { payload })
      const { method, params } = getMethodAndParams(payload)
      const v2meta = getV2Meta(payload)
      const metadata = v2meta || connector?.session?.peerMeta

      const chain = params[0]
      const chainDetails = chains.find(_ => Number(_.chainId) === Number(chain.chainId))
      showApprove({
        walletAddress: wallet.account,
        metadata,
        modalType: 'switchchain',
        message: `${chain.name || chainDetails.name || chain.chainId}: ${getChainRpc(chain)}`,
        onApprove: () => {
          chain.explorers = chain.blockExplorerUrls
          switchChain(chain)
        },
        onReject: () => rejectRequest(connector, payload.id, payload.topic),
      })
    },
    [showApprove, chains, switchChain],
  )

  const handleSessionDisconnect = useCallback(
    async connector => {
      const metadata = v2session || connector?.session?.peerMeta
      const isV2 = connector === cachedV2Connector
      log.info('ending session:', { metadata, session: connector?.session })
      if (isV2) {
        await connector.disconnectSession({ topic: metadata.topic, reason: getSdkError('USER_DISCONNECTED') })
        setSession(undefined)
        AsyncStorage.removeItem('walletconnect_requestedChain_v2')
      } else {
        connector?.killSession({ message: 'USER_TERMINATED' }).catch()
        cachedConnector = undefined
        AsyncStorage.removeItem('walletconnect')
        AsyncStorage.removeItem('walletconnect_requestedChain')
        await delay(500)
      }
      setConnector(undefined)
      await reconnect() //for v2 display next active connection
    },
    [setConnector, v2session, reconnect],
  )

  const handleUnsupportedRequest = useCallback(
    (payload, connector) => {
      const v2meta = getV2Meta(payload)
      const metadata = v2meta || connector?.session?.peerMeta
      showApprove({
        walletAddress: wallet.account,
        payload,
        metadata,
        modalType: 'error',
      })
      rejectRequest(connector, payload.id, payload.topic, getSdkError('WC_METHOD_UNSUPPORTED').message)
    },
    [wallet],
  )

  const handleCallRequest = useCallback(
    async (connector, payload) => {
      try {
        const { method, params } = getMethodAndParams(payload)
        logger.debug('handleCallRequest', { method, params })
        let message

        if (method === 'eth_sign') {
          message = params?.[1]
        }

        if (method === 'personal_sign') {
          message = params?.[0]
          log.debug('personal_sign:', { message })
          if (web3Utils.isHex(message)) {
            message = web3Utils.hexToUtf8(message)
            log.debug('personal_sign:', { message })
          }
        }

        if (method.includes('eth_signTypedData')) {
          if (params?.length && params[0]) {
            message = params?.[0] ?? null
            if (web3Utils.isAddress(params?.[0] ?? '')) {
              message = params?.[1] ?? null
            }
          }
        }

        log.debug('sign message:', { message })

        if (message) {
          return handleSignRequest(message, payload, connector)
        }

        if (['eth_signTransaction', 'eth_sendTransaction'].includes(method)) {
          const transaction = params?.[0] ?? null

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

        if (['wallet_addEthereumChain', 'wallet_switchEthereumChain'].includes(method)) {
          return handleSwitchChainRequest(payload, connector)
        }

        if (method === 'wallet_scanQrCode') {
          return handleScanRequest(payload, connector)
        }

        handleUnsupportedRequest(payload, connector)
        throw new Error(`Unsupported request: ${method}`)
      } catch (e) {
        log.warn('failed handling sign request', e.message, e, { payload })
        throw e
      }
    },
    [
      handleSignRequest,
      handleUnsupportedRequest,
      handleSwitchChainRequest,
      handleScanRequest,
      handleTxRequest,
      activeConnector,
    ],
  )
  const connect = useCallback(
    async (uriOrSession, chainId) => {
      if (wallet) {
        const session = typeof uriOrSession === 'string' ? undefined : uriOrSession
        const uri = typeof uriOrSession === 'string' ? uriOrSession : undefined

        const { version = null } = (uri && parseUri(uri)) || {}
        log.debug('got uri:', { uri, session, wallet, version })
        if (session || version === 1) {
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
          initializeV1(connector)

          log.debug('got uri created connection:', { uri, session, wallet, connector })
          if (session && connector.pending && !connector.connected) {
            log.debug('calling handlesession from connect...')
            handleSessionRequest(connector, { params: [{ chainId }] })
          }
          setConnector(connector)
          cachedConnector = connector

          return connector
        } else if (isInitialized && version == 2) {
          const pairResult = await cachedV2Connector.core.pairing.pair({ uri })
          log.debug('v2 paired:', { uri, pairResult })
          setConnector(cachedV2Connector)
        }
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
      isInitialized,
    ],
  )

  const sendTx = useCallback(
    async (params, payload, web3, chainDetails, connector) => {
      const nonce = await web3.eth.getTransactionCount(wallet.account)
      let txHash
      const onTransactionHash = result => {
        txHash = result
        log.info('tx send success:', { result })
        payload?.id && approveRequest(connector, payload.id, payload.topic, result)
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
    const web3 = await getWeb3(chain)
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

  // initialize v2 connector effect
  useEffect(() => {
    if (!isInitialized || cachedV2Connector.initialized) {
      return
    }
    const sessions = cachedV2Connector.getActiveSessions()
    log.debug('v2 init active sessions:', { sessions })
    // Object.values(sessions).map(s =>
    //   cachedV2Connector.disconnectSession({ topic: s.topic, reason: getSdkError('USER_DISCONNECTED') }),
    // )
    cachedV2Connector.on('session_proposal', event => handleSessionRequest(cachedV2Connector, event))
    cachedV2Connector.on('session_request', event => {
      const sessionv2 = cachedV2Connector.getActiveSessions()[event.topic]
      setV2Session(sessionv2) //set latest request as the active session, required for switchchain
      handleCallRequest(cachedV2Connector, event)
    })
    cachedV2Connector.on('session_ping', event => log.info('v2 incoming session_ping:', event))
    cachedV2Connector.on('session_event', event => log.info('v2 incoming session_event:', event))
    cachedV2Connector.on('session_delete', event => log.info('v2 incoming session_delete:', event))
    cachedV2Connector.core.pairing.events.on('pairing_ping', event => log.info('v2 incoming pairing_ping:', event))
    cachedV2Connector.core.pairing.events.on('pairing_delete', event => log.info('v2 incoming pairing_delete:', event))
    cachedV2Connector.core.pairing.events.on('pairing_expire', event => log.info('v2 incoming pairing_expire:', event))
    cachedV2Connector.initialized = true
    reconnect()
  }, [isInitialized, reconnect, setV2Session, handleCallRequest, handleSessionRequest])

  //v1 connector initialize
  const initializeV1 = connector => {
    log.debug('subscribing to v1 connector', { connector })

    const unsubscribe = () => {
      connector.off('disconnect')
      connector.off('call_request')
      connector.off('session_request')
    }

    // since connector is cached it could an already existing one, so we clear the subscriptions
    unsubscribe()

    // Subscribe to session requests
    connector.on('session_request', (error, payload) => {
      log.debug('session_request:', { payload, error })
      if (error) {
        throw error
      }

      handleSessionRequest(connector, payload)
    })

    // Subscribe to call requests
    connector.on('call_request', (error, payload) => {
      const { method, params } = payload
      log.debug('call_request:', { payload, error, method, params })

      if (error) {
        throw error
      }

      setConnector(connector)
      handleCallRequest(connector, payload)
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
  }

  const disconnect = useCallback(() => {
    if (activeConnector) {
      handleSessionDisconnect(activeConnector)
    }
  }, [activeConnector, handleSessionDisconnect])

  const setV2Session = useCallback(
    sessionv2 => {
      let requestedChainIdV2 = Number(
        (sessionv2?.namespaces?.eip155?.chains?.[0] || `:${Config.networkId}`).split(':')[1],
      )
      if (sessionv2) {
        log.debug('setting v2 session and active connector', { sessionv2 })
        setConnector(cachedV2Connector)
        setSession({
          ...sessionv2.peer.metadata,
          topic: sessionv2.topic,
          chainId: requestedChainIdV2,
        })
        setChain(chains.find(_ => _.chainId === requestedChainIdV2))
        AsyncStorage.setItem('walletconnect_requestedChain_v2', requestedChainIdV2)
      }
    },
    [setSession, setConnector],
  )
  const reconnect = useCallback(async () => {
    log.debug('reconnect:', { activeConnector, isInitialized, cachedV2Connector })

    const session = await AsyncStorage.getItem('walletconnect')
    const chainId = await AsyncStorage.getItem('walletconnect_requestedChain')

    log.debug('reconnecting v1:', { session, chainId })
    if (session) {
      return connect(
        session,
        session.chainId,
      )
    }

    if (isInitialized) {
      // handle v2
      const sessions = cachedV2Connector.getActiveSessions()
      const sessionv2 = last(Object.values(sessions))
      log.debug('reconnecting v2:', { sessions, sessionv2 })
      setV2Session(sessionv2)
    }
  }, [isInitialized, connect, activeConnector, chains, setV2Session])

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
  }, [])

  useEffect(() => {
    const chainDetails = chains.find(
      _ => Number(_.chainId) === Number(activeConnector?.session?.chainId || v2session?.chainId),
    )
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
  }, [activeConnector, chains, v2session, setChain, handleTxRequest])

  useEffect(() => {
    ;(async () => {
      if (chain && pendingTxs) {
        try {
          const web3 = await getWeb3(chain)
          const curNonce = await web3.eth.getTransactionCount(wallet.account)
          const stillPending = pendingTxs.filter(_ => _.chainId === chain.chainId && _.nonce === curNonce)
          setChainPendingTxs(stillPending)
        } catch (e) {
          log.warn('failed pending txs effect:', { chain, pendingTxs })
        }
      }
    })()
  }, [pendingTxs, chain, wallet, setChainPendingTxs])

  const isConnected = activeConnector?.connected || v2session

  console.log({
    activeConnector,
    isConnected,
    session: activeConnector?.session || v2session,
    version: activeConnector === cachedV2Connector ? 2 : 1,
  })
  return {
    isWCDialogShown: isDialogShown,
    wcConnect: connect,
    wcVersion: activeConnector === cachedV2Connector ? 2 : 1,
    wcConnected: isConnected,
    wcSession: activeConnector?.session
      ? { ...activeConnector.session.peerMeta, chainId: activeConnector.session.chainId }
      : v2session,
    wcDisconnect: disconnect,
    wcSwitchChain: switchChain,
    wcChain: chain,
    chainPendingTxs,
    cancelTx,
  }
}
