// @flow
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWalletConnect as useWC } from '@walletconnect/react-native-dapp'
import { default as Web3Provider } from '@walletconnect/web3-provider'
import logger from '../../logger/js-logger'
import { chains } from './ThirdPartyWalletProvider'

const log = logger.child({ from: 'useWalletConnect' })

export const useWalletConnect = () => {
  const connector = useWC()
  const { connect, connected, chainId, accounts } = connector
  const [connecting, setConnecting] = useState(false)
  const [provider, setProvider] = useState()

  const isValidChain = useMemo(() => chainId && chains.find(c => Number(c.id) === Number(chainId)), [chainId])

  useEffect(() => {
    if (!connected) {
      setProvider(undefined)
    } else {
      try {
        const web3Provider = new Web3Provider({
          connector: connector,
          qrcode: false,
          rpc: { 122: 'https://rpc.fuse.io' },
        })
        web3Provider
          .enable()
          .then(accounts => {
            log.debug('connected web3Provider', { acc: web3Provider.accounts, web3Provider })
            setProvider(web3Provider)
          })
          .catch(e => log.warn('useEffect enable failed:', e.message, e))
      } catch (e) {
        log.warn('useEffect connected failed:', e.message, e)
      }
    }
  }, [connected])

  const disconnect = useCallback(() => {
    return connected && connector?.killSession({ message: 'user terminated' })
  }, [connector, connected])

  const setChain = useCallback(
    ({ chainId }: { chainId: string }) => {
      if (!connected) {
        return
      }
      connector.sendCustomRequest({ method: 'wallet_switchEthereumChain', params: [{ chainId }] })
    },
    [connected, connector],
  )

  const connectSession = useCallback(async () => {
    if (connected) {
      return
    }
    setConnecting(true)
    try {
      const session = await connect({ chainId: 122 })
      log.debug('connectSession', { session, connector })
    } catch (e) {
      log.warn('connectSession failed:', e.message, e)
    }

    setConnecting(false)
  }, [connect, setConnecting, setProvider, connector, connected])

  return {
    connect: connectSession,
    disconnect,
    connectedChain: chainId,
    isValidChain,
    connecting,
    accounts,
    provider,
    setChain,
    walletName: 'WalletConnectNative',
  }
}
