// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Config from '../../config/config'
import logger from '../logger/js-logger'
import GoodWalletLogin from '../login/GoodWalletLoginClass'
import { UserStorage } from '../userStorage/UserStorageClass'
import UserProperties from '../userStorage/UserProperties'
import getDB from '../realmdb/RealmDB'
import { GoodWallet } from './GoodWalletClass'
import HDWalletProvider from './HDWalletProvider'

const log = logger.child({ from: 'GoodWalletProvider' })

export const GoodWalletContext = React.createContext({
  userStorage: undefined,
  error: undefined,
  goodWallet: undefined,
  init: undefined,
})

export const GoodWalletProvider = ({ children }) => {
  const [{ goodWallet, userStorage }, setWalletAndStorage] = useState({})
  const [web3Provider, setWeb3] = useState()
  const [isLoggedInJWT, setLoggedInJWT] = useState()

  const db = getDB()

  //when new wallet set the web3provider for future use with usedapp
  useEffect(() => {
    if (goodWallet) {
      // FIXME: acquire rpcHost for metamask / walletconnect
      const rpcHost = goodWallet.wallet._provider.host
      if (!rpcHost) {
        return
      }
      setWeb3(new HDWalletProvider(goodWallet.accounts, rpcHost))
    }
  }, [goodWallet])

  const switchWeb3ProviderNetwork = useCallback(
    // eslint-disable-next-line require-await
    async id => {
      const rpcHost = goodWallet.wallet._provider.host
      if (!rpcHost) {
        return
      }
      setWeb3(new HDWalletProvider(goodWallet.accounts, rpcHost))
    },
    [web3Provider],
  )

  const initWalletAndStorage = useCallback(
    async (seedOrWeb3, type: 'SEED' | 'METAMASK' | 'WALLETCONNECT' | 'OTHER') => {
      try {
        const web3 = type !== 'SEED' ? seedOrWeb3 : undefined
        const wallet = new GoodWallet({
          mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
          web3,
          web3Transport: Config.web3TransportProvider,
          httpWeb3provider: web3 !== undefined ? web3.currentProvider?.http?.url : undefined,
        })
        await wallet.ready
        const userStorage = new UserStorage(wallet, db, new UserProperties(db))
        await UserStorage.ready
        setWalletAndStorage({ goodWallet: wallet, userStorage })
        log.debug('initWalletAndStorage done')

        return wallet
      } catch (e) {
        log.error('failed initializing wallet and userstorage:', e.message, e)

        throw e
      }
    },
    [],
  )

  const login = useCallback(
    async refresh => {
      if ((!refresh && isLoggedInJWT) || !goodWallet || !userStorage) {
        return isLoggedInJWT
      }
      await userStorage.ready
      const walletLogin = new GoodWalletLogin(goodWallet, userStorage)

      // the login also re-initialize the api with new jwt
      await walletLogin.auth(refresh).catch(e => {
        log.error('failed auth:', e.message, e)

        throw e
      })
      setLoggedInJWT(walletLogin)
      log.debug('walletLogin', await walletLogin.getJWT(), { refresh })
      return walletLogin
    },
    [goodWallet, userStorage, isLoggedInJWT, setLoggedInJWT],
  )

  //perform login on wallet change
  useEffect(() => {
    if (goodWallet && userStorage) {
      log.debug('on wallet ready')
      login()
    }
  }, [goodWallet, userStorage])

  return (
    <GoodWalletContext.Provider
      value={{
        userStorage,
        goodWallet,
        initWalletAndStorage,
        web3Provider,
        switchWeb3ProviderNetwork,
        login,
        isLoggedInJWT,
      }}
    >
      {children}
    </GoodWalletContext.Provider>
  )
}

export const useWallet = () => {
  const { goodWallet } = useContext(GoodWalletContext)
  return goodWallet
}
