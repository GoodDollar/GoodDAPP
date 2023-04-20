import { noop } from 'lodash'
import React, { createContext, Fragment, useCallback, useEffect, useState } from 'react'
import Config from '../../config/config'

const { env, network } = Config
const isTestEnv = env === 'test'

const emptyCtx = {
  useGetBridgeData: noop,
  useBridge: noop,
}

export const Web3SDKContext = createContext(emptyCtx)

export const Web3SDKProvider = ({ web3Provider, children }) => {
  const [ctx, setCtx] = useState({
    ...emptyCtx,
    Web3Provider: Fragment,
    loaded: isTestEnv,
  })

  const updateCtx = useCallback(data => setCtx(ctx => ({ ...ctx, ...data })), [setCtx])

  useEffect(() => {
    if (isTestEnv) {
      return
    }

    let [env] = network.split('-')

    if (env === 'development' || !['fuse', 'staging', 'production'].includes(env)) {
      env = 'fuse'
    }

    Promise.all([import('@usedapp/core'), import('@gooddollar/web3sdk-v2')]).then(([usedapp, sdkv2]) => {
      const { Goerli, Mainnet } = usedapp
      const { Celo, Fuse, useGetBridgeData, useBridge, Web3Provider: GoodWeb3Provider } = sdkv2

      const config = {
        pollingInterval: 15000,
        networks: [Goerli, Mainnet, Fuse, Celo],
        readOnlyChainId: undefined,
        readOnlyUrls: {
          1: 'https://rpc.ankr.com/eth',
          122: 'https://rpc.fuse.io',
          42220: 'https://forno.celo.org',
        },
      }

      const Web3Provider = ({ web3Provider, children }) => (
        <GoodWeb3Provider web3Provider={web3Provider} env={env} config={config}>
          {children}
        </GoodWeb3Provider>
      )

      updateCtx({ Web3Provider, useGetBridgeData, useBridge, loaded: true })
    })
  }, [updateCtx])

  const { Web3Provider, useGetBridgeData, useBridge, loaded } = ctx

  return (
    <Web3SDKContext.Provider value={{ useGetBridgeData, useBridge }}>
      {loaded && <Web3Provider web3Provider={web3Provider}>{children}</Web3Provider>}
    </Web3SDKContext.Provider>
  )
}
