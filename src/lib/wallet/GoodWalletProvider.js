// @flow
import React, { useCallback, useContext, useState } from 'react'
import Config from '../../config/config'
import logger from '../logger/js-logger'
import GoodWalletLogin from '../login/GoodWalletLoginClass'
import { UserStorage } from '../userStorage/UserStorageClass'
import UserProperties from '../userStorage/UserProperties'
import getDB from '../realmdb/RealmDB'
import usePropsRefs from '../hooks/usePropsRefs'
import { GlobalTogglesContext } from '../contexts/togglesContext'
import AsyncStorage from '../utils/asyncStorage'
import { IS_LOGGED_IN } from '../constants/localStorage'
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
  const { isLoggedInRouter } = useContext(GlobalTogglesContext)
  const [{ goodWallet, userStorage }, setWalletAndStorage] = useState({})
  const [web3Provider, setWeb3] = useState()
  const [isLoggedInJWT, setLoggedInJWT] = useState()
  const [balance, setBalance] = useState()
  const [dailyUBI, setDailyUBI] = useState()
  const [isCitizen, setIsCitizen] = useState()
  const [shouldLoginAndWatch] = usePropsRefs([disableLoginAndWatch === false])

  const db = getDB()

  const verifyUserIsRegistered = async walletLogin => {
    const { decoded, jwt } = await walletLogin.validateJWTExistenceAndExpiration()
    const { aud } = decoded || {}

    log.info('verifyUserIsRegistered: jwt data', { decoded, jwt, aud })

    if (!decoded || aud === 'unsigned') {
      throw new Error('jwt is of unsigned user', 'UnsignedJWTError')
    }
  }

  const update = useCallback(
    async goodWallet => {
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
    },
    [setBalance, setDailyUBI, setIsCitizen],
  )

  const initWalletAndStorage = useCallback(
    async (seedOrWeb3, type: 'SEED' | 'WEB3WALLET') => {
      try {
        log.info('initWalletAndStorage', { seedOrWeb3, type, isLoggedInRouter })

        const web3 = 'WEB3WALLET' === type ? seedOrWeb3 : undefined
        const wallet = new GoodWallet({
          type,
          mnemonic: type === 'WEB3WALLET' ? undefined : seedOrWeb3,
          web3,
          web3Transport: Config.web3TransportProvider,
        })
        await wallet.ready

        // when new wallet set the web3provider for future use with usedapp
        if (type === 'SEED') {
          setWeb3(new HDWalletProvider(wallet.accounts, wallet.wallet.currentProvider.host))
        } else {
          setWeb3(seedOrWeb3)
        }

        log.info('initWalletAndStorage wallet ready', { type, seedOrWeb3 })
        
        const storage = new UserStorage(wallet, db, new UserProperties(db))

        await storage.ready

        if (shouldLoginAndWatch()) {
          await Promise.all([_login(wallet, storage, false), update(wallet)])
        }

        if (isLoggedInRouter) {
          AsyncStorage.setItem(IS_LOGGED_IN, true)
          await storage.initRegistered()

          if (shouldLoginAndWatch()) {
            const { userProperties } = storage

            // only if user signed up then we can await for his properties
            // (because otherwise he wont have valid mongodb jwt)
            await userProperties.ready

            const lastBlock = userProperties.get('lastBlock')

            log.debug('starting watchBalanceAndTXs', { lastBlock })

            wallet.watchEvents(parseInt(lastBlock), toBlock => userProperties.set('lastBlock', parseInt(toBlock)))

            wallet.balanceChanged(() => update(wallet))
          }
        }

        log.info('initWalletAndStorage storage done')

        global.userStorage = storage
        global.wallet = wallet
        setWalletAndStorage({ goodWallet: wallet, userStorage: storage })

        log.info('initWalletAndStorage done')
        return [wallet, storage]
      } catch (e) {
        log.warn('failed initializing wallet and userstorage:', e.message, e)

        throw e
      }
    },
    [setWeb3, setWalletAndStorage, isLoggedInRouter],
  )

  const _login = useCallback(
    async (wallet, storage, refresh) => {
      try {
        const walletLogin = new GoodWalletLogin(wallet, storage)

        // the login also re-initialize the api with new jwt
        const { jwt } = await walletLogin.auth(refresh)

        if (isLoggedInRouter) {
          //verify user is registred and logged in
          await verifyUserIsRegistered(walletLogin)
        }
        
        setLoggedInJWT(walletLogin)

        log.info('walletLogin', { jwt, refresh })
        return walletLogin
      } catch (e) {
        //retry once in case jwt needs refresh
        if (!refresh) {
          return _login(wallet, storage, true)
        }
        log.error('failed auth:', e.message, e)
        throw e
      }
    },
    [setLoggedInJWT, isLoggedInRouter],
  )

  const login = useCallback(
    async (withRefresh = false) => {
      let refresh = withRefresh
      
      if (isLoggedInJWT) {
        const { decoded, jwt } = await isLoggedInJWT.validateJWTExistenceAndExpiration()
        
        if (!decoded || !jwt) {
          refresh = true
        }
      }
      
      if ((!refresh && isLoggedInJWT) || !goodWallet || !userStorage) {
        return isLoggedInJWT
      }

      return _login(goodWallet, userStorage, refresh)
    },
    [goodWallet, userStorage, isLoggedInJWT, _login],
  )

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
