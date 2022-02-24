// @flow
import React, { useCallback, useEffect, useState } from 'react'
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
  const [goodWallet, setWallet] = useState()
  const [userStorage, setUserStorage] = useState()
  const [web3Provider, setWeb3] = useState()
  const [isLoggedInJWT, setLoggedInJWT] = useState()

  const db = getDB()

  //when new wallet set the web3provider for future use with usedapp
  useEffect(() => {
    if (goodWallet) {
      setWeb3(new HDWalletProvider(goodWallet.accounts, goodWallet.wallet._provider.host))
    }
  }, [goodWallet])

  const switchWeb3ProviderNetwork = useCallback(
    // eslint-disable-next-line require-await
    async id => {
      setWeb3(new HDWalletProvider(goodWallet.accounts, goodWallet.wallet._provider.host))
    },
    [web3Provider],
  )

  const initWallet = useCallback(async (seedOrWeb3, type: 'SEED' | 'METAMASK' | 'WALLETCONNECT' | 'OTHER') => {
    try {
      const wallet = new GoodWallet({
        mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
        web3: type !== 'SEED' ? seedOrWeb3 : undefined,
        web3Transport: Config.web3TransportProvider,
      })
      await wallet.init()
      const userStorage = new UserStorage(wallet, db, new UserProperties(db))
      await UserStorage.ready
      setUserStorage(userStorage)
      log.debug('initWalletAndStorage done')

      setWallet(wallet)

      return wallet
    } catch (e) {
      log.error('failed initializing wallet and userstorage:', e.message, e)

      throw e
    }
  }, [])

  const login = useCallback(
    async refresh => {
      if ((!refresh && isLoggedInJWT) || !goodWallet || !userStorage) {
        return
      }
      await userStorage.ready
      const walletLogin = new GoodWalletLogin(goodWallet, userStorage)

      // the login also re-initialize the api with new jwt
      await walletLogin.auth(refresh).catch(e => {
        log.error('failed auth:', e.message, e)

        throw e
      })
      setLoggedInJWT(true)
      log.debug('walletLogin', await walletLogin.getJWT())
    },
    [goodWallet, userStorage, isLoggedInJWT],
  )

  //perform login on wallet change
  useEffect(() => {
    login()
  }, [goodWallet, userStorage])

  return (
    <GoodWalletContext.Provider
      value={{
        userStorage,
        goodWallet,
        init: initWallet,
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
