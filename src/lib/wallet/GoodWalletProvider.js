// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import Config from '../../config/config'
import logger from '../logger/js-logger'
import GoodWalletLogin from '../login/GoodWalletLoginClass'
import { UserStorage } from '../userStorage/UserStorageClass'
import UserProperties from '../userStorage/UserProperties'
import getDB from '../realmdb/RealmDB'
import usePropsRefs from '../hooks/usePropsRefs'
import { GoodWallet } from './GoodWalletClass'
import HDWalletProvider from './HDWalletProvider'

const log = logger.child({ from: 'GoodWalletProvider' })

export const GoodWalletContext = React.createContext({
  userStorage: undefined,
  error: undefined,
  goodWallet: undefined,
  init: undefined,
})

/**
 *
 * @param {boolean} disableLoginAndWatch - used in tests to disable server interaction
 * @returns
 */
export const GoodWalletProvider = ({ children, disableLoginAndWatch = false }) => {
  const [{ goodWallet, userStorage }, setWalletAndStorage] = useState({})
  const [web3Provider, setWeb3] = useState()
  const [isLoggedInJWT, setLoggedInJWT] = useState()
  const [balance, setBalance] = useState()
  const [dailyUBI, setDailyUBI] = useState()
  const [isCitizen, setIsCitizen] = useState()
  const [shouldLoginAndWatch] = usePropsRefs([disableLoginAndWatch === false])

  const db = getDB()

  // when new wallet set the web3provider for future use with usedapp
  useEffect(() => {
    if (!goodWallet) {
      return
    }

    setWeb3(new HDWalletProvider(goodWallet.accounts, goodWallet.wallet._provider.host))
  }, [goodWallet, setWeb3])

  const initWalletAndStorage = useCallback(
    async (seedOrWeb3, type: 'SEED' | 'METAMASK' | 'WALLETCONNECT' | 'OTHER', initRegistered = false) => {
      try {
        const wallet = new GoodWallet({
          mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
          web3: type !== 'SEED' ? seedOrWeb3 : undefined,
          web3Transport: Config.web3TransportProvider,
        })

        await wallet.ready
        log.info('initWalletAndStorage wallet ready', { type, seedOrWeb3 })

        const storage = new UserStorage(wallet, db, new UserProperties(db))

        await storage.ready

        if (initRegistered) {
          await storage.initRegistered()
        }

        log.info('initWalletAndStorage storage done')

        global.userStorage = storage
        global.wallet = wallet
        setWalletAndStorage({ goodWallet: wallet, userStorage: storage })

        log.info('initWalletAndStorage done')
        return wallet
      } catch (e) {
        log.error('failed initializing wallet and userstorage:', e.message, e)

        throw e
      }
    },
    [setWalletAndStorage],
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
      log.info('walletLogin', await walletLogin.getJWT(), { refresh })

      return walletLogin
    },
    [goodWallet, userStorage, isLoggedInJWT, setLoggedInJWT],
  )

  // perform login on wallet change
  useEffect(() => {
    let eventId

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

      // entitelment is separate because it depends on msg.sender
      const [[{ balance }, { ubi }, { isCitizen }]] = await goodWallet.multicallFuse.all([calls])

      setBalance(parseInt(balance))
      setDailyUBI(parseInt(ubi))
      setIsCitizen(isCitizen)
    }

    const loginAndWatch = async () => {
      await login()

      const lastBlock = userStorage.userProperties.get('lastBlock') || 6400000

      // init initial wallet balance/dailyubi
      await update()

      log.debug('starting watchBalanceAndTXs', { lastBlock })

      goodWallet.watchEvents(parseInt(lastBlock), toBlock =>
        userStorage.userProperties.set('lastBlock', parseInt(toBlock)),
      )

      eventId = goodWallet.balanceChanged(update)
    }

    if (goodWallet && userStorage) {
      log.debug('on wallet ready')

      if (shouldLoginAndWatch()) {
        loginAndWatch()
      }
    }

    return () => {
      log.debug('stop watching', { eventId })

      if (goodWallet) {
        goodWallet.setIsPollEvents(false)
      }

      if (eventId) {
        goodWallet.unsubscribeFromEvent(eventId)
      }
    }
  }, [goodWallet, userStorage, login, shouldLoginAndWatch, setBalance, setDailyUBI, setIsCitizen])

  return (
    <GoodWalletContext.Provider
      value={{
        userStorage,
        goodWallet,
        initWalletAndStorage,
        web3Provider,
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
export const useUserStorage = (): UserStorage => {
  const { userStorage } = useContext(GoodWalletContext)

  return userStorage
}
export const useWalletData = () => {
  const { dailyUBI, balance, isCitizen } = useContext(GoodWalletContext)

  return { dailyUBI, balance, isCitizen }
}
