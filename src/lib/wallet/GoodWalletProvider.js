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
  const [balance, setBalance] = useState()
  const [dailyUBI, setDailyUBI] = useState()
  const [isCitizen, setIsCitizen] = useState()

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

  const initWalletAndStorage = useCallback(
    async (seedOrWeb3, type: 'SEED' | 'METAMASK' | 'WALLETCONNECT' | 'OTHER') => {
      try {
        const wallet = new GoodWallet({
          mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
          web3: type !== 'SEED' ? seedOrWeb3 : undefined,
          web3Transport: Config.web3TransportProvider,
        })
        await wallet.ready
        const userStorage = new UserStorage(wallet, db, new UserProperties(db))
        await userStorage.ready
        setWalletAndStorage({ goodWallet: wallet, userStorage })
        log.debug('initWalletAndStorage done')
        global.userStorage = userStorage
        global.wallet = wallet
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

  const watchBalanceAndTXs = useCallback(() => {
    const update = async () => {
      const calls = [
        {
          balance: goodWallet.tokenContract.methods.balanceOf(goodWallet.account),
        },
        {
          ubi: goodWallet.UBIContract.methods.checkEntitlement(goodWallet.account),
        },
        {
          isCitizen: goodWallet.identityContract.methods.isWhitelisted(goodWallet.account),
        },
      ]

      //entitelment is separate because it depends on msg.sender
      const [[{ balance }, { ubi }, { isCitizen }]] = await goodWallet.multicallFuse.all([calls])

      setBalance(parseInt(balance))
      setDailyUBI(parseInt(ubi))
      setIsCitizen(isCitizen)
    }

    const lastBlock = userStorage.userProperties.get('lastBlock') || 6400000
    log.debug('starting watchBalanceAndTXs', { lastBlock })

    //init initial wallet balance/dailyubi
    update()
    goodWallet.watchEvents(parseInt(lastBlock), toBlock =>
      userStorage.userProperties.set('lastBlock', parseInt(toBlock)),
    )
    const eventId = goodWallet.balanceChanged(event => update())
    return eventId
  }, [goodWallet, userStorage])

  //perform login on wallet change
  useEffect(() => {
    let eventId
    if (goodWallet && userStorage) {
      log.debug('on wallet ready')
      login()
      eventId = watchBalanceAndTXs()
    }
    return () => {
      log.debug('stop watching', eventId)
      goodWallet && goodWallet.setIsPollEvents(false)
      eventId && goodWallet.unsubscribeFromEvent(eventId)
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
        balance,
        dailyUBI,
        isCitizen,
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
export const useUserStorage = () => {
  const { userStorage } = useContext(GoodWalletContext)
  return userStorage
}
export const useWalletData = () => {
  const { dailyUBI, balance, isCitizen } = useContext(GoodWalletContext)
  return { dailyUBI, balance, isCitizen }
}
