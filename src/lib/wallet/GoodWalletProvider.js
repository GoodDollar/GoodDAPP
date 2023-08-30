// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { noop } from 'lodash'
import { Web3Provider } from '@ethersproject/providers'
import { Celo, Fuse, Web3Provider as GoodWeb3Provider } from '@gooddollar/web3sdk-v2'
import { Goerli, Mainnet } from '@usedapp/core'
import { t } from '@lingui/macro'

import Config from '../../config/config'
import logger from '../logger/js-logger'
import GoodWalletLogin from '../login/GoodWalletLoginClass'
import { UserStorage } from '../userStorage/UserStorageClass'
import UserProperties from '../userStorage/UserProperties'
import getDB from '../realmdb/RealmDB'
import usePropsRefs from '../hooks/usePropsRefs'
import { GlobalTogglesContext } from '../contexts/togglesContext'
import api from '../API/api'
import { getNetworkName, NETWORK_ID } from '../constants/network'
import { useDialog } from '../dialog/useDialog'
import { setChainId } from '../analytics/analytics'
import { GoodWallet } from './GoodWalletClass'
import { JsonRpcProviderWithSigner } from './JsonRpcWithSigner'
type NETWORK = $Keys<typeof NETWORK_ID>

/** CELO TODO:
 * 1. lastblock - done
 * 2. multicall - done
 * 3. chainid as input to init - done
 * 4. create multiple wallets, stop pollevents on switch - done
 * 5. BigGoodDollar - done
 * 6. weiToGd, gdTowei, weiToMask, maskToWei - done
 * 7. claim button not enabled when 18 decimals < 0.00 but is non 0 - done
 * 8. how do we store in feed? without decimals needs to format per chain, with decimals, need to upgrade users feeds - done saving chain id
 * 9. claim feed item add chainId
 * 10. switch button and logic
 **/
const log = logger.child({ from: 'GoodWalletProvider' })

const makeWeb3Provider = wallet =>
  new Web3Provider(
    new JsonRpcProviderWithSigner(
      new Web3Provider(wallet.wallet.currentProvider), // this will also use our multiplehttpprovider
      wallet.wallet.eth.accounts.wallet[0].privateKey,
    ),
  )

export const GoodWalletContext = React.createContext({
  userStorage: UserStorage,
  goodWallet: undefined,
  celowallet: undefined,
  fusewallet: undefined,
  balance: '0',
  totalBalance: '0',
  fuseBalance: '0',
  celoBalance: '0',
  init: () => {},
  initWalletAndStorage: undefined,
  login: undefined,
  isLoggedInJWT: undefined,
  dailyUBI: undefined,
  isCitizen: false,
  switchNetwork: undefined,
})

/**
 *
 * @param {boolean} disableLoginAndWatch - used in tests to disable server interaction
 * @returns
 */
export const GoodWalletProvider = ({ children, disableLoginAndWatch = false }) => {
  const { isLoggedInRouter } = useContext(GlobalTogglesContext)
  const [{ goodWallet, userStorage, fusewallet, celowallet, web3Provider }, setWalletAndStorage] = useState({})
  const [isLoggedInJWT, setLoggedInJWT] = useState()
  const [balance, setBalance] = useState({ totalBalance: '0', balance: '0', fuseBalance: '0', celoBalance: '0' })
  const [dailyUBI, setDailyUBI] = useState('0')
  const [isCitizen, setIsCitizen] = useState()
  const [shouldLoginAndWatch] = usePropsRefs([disableLoginAndWatch === false])

  const db = getDB()

  const updateWalletData = useCallback(
    async goodWallet => {
      const { tokenContract, UBIContract, identityContract, account } = goodWallet

      const calls = [
        {
          balance: tokenContract.methods.balanceOf(account),
        },
        {
          ubi: UBIContract.methods.checkEntitlement(account),
        },
        {
          isCitizen: identityContract.methods.isWhitelisted(account),
        },
      ]

      // entitelment is separate because it depends on msg.sender
      const [[{ balance }, { ubi }, { isCitizen }]] = await goodWallet.multicallFuse.all([calls])

      let totalBalance = balance
      let fuseBalance = 0,
        celoBalance = 0
      if (fusewallet && celowallet) {
        ;[fuseBalance = '0', celoBalance = '0'] = await Promise.all([fusewallet?.balanceOf(), celowallet?.balanceOf()])
        fuseBalance = Number(fusewallet.toDecimals(fuseBalance))
        celoBalance = Number(celowallet.toDecimals(celoBalance))
        totalBalance = (fuseBalance + celoBalance).toFixed(2)
      }
      log.debug('updateWalletData', {
        balance,
        totalBalance,
        fuseBalance: fuseBalance.toFixed(2),
        celoBalance: celoBalance.toFixed(2),
      })

      setBalance({ balance, totalBalance, fuseBalance: fuseBalance.toFixed(2), celoBalance: celoBalance.toFixed(2) })

      setDailyUBI(ubi)
      setIsCitizen(isCitizen)
    },
    [setBalance, setDailyUBI, setIsCitizen, fusewallet, celowallet],
  )

  const updateWalletListeners = useCallback(
    goodWallet => {
      const lastBlock = userStorage.userProperties.get('lastBlock_' + goodWallet.networkId)

      log.debug('updateWalletListeners', { lastBlock })

      goodWallet.watchEvents(lastBlock ? parseInt(lastBlock) : undefined, toBlock =>
        userStorage.userProperties.set('lastBlock_' + goodWallet.networkId, parseInt(toBlock)),
      )

      goodWallet.balanceChanged(() => updateWalletData(goodWallet))

      setChainId(goodWallet.networkId)
    },
    [userStorage],
  )

  const initWalletAndStorage = useCallback(
    async (seedOrWeb3, type: 'SEED' | 'METAMASK' | 'WALLETCONNECT' | 'OTHER') => {
      try {
        const fusewallet = new GoodWallet({
          mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
          web3: type !== 'SEED' ? seedOrWeb3 : undefined,
          web3Transport: Config.web3TransportProvider,
          network: getContractsNetwork('fuse'),
        })

        const celowallet = new GoodWallet({
          mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
          web3: type !== 'SEED' ? seedOrWeb3 : undefined,
          web3Transport: Config.web3TransportProvider,
          network: getContractsNetwork('celo'),
        })

        const wallet = new GoodWallet({
          mnemonic: type === 'SEED' ? seedOrWeb3 : undefined,
          web3: type !== 'SEED' ? seedOrWeb3 : undefined,
          web3Transport: Config.web3TransportProvider,
          network: Config.network,
        })

        await wallet.ready

        let web3Provider = seedOrWeb3

        // create a web3provider compatible wallet, so can be compatible with @gooddollar/web3sdk-v2 and @gooddollar/good-design
        if (type === 'SEED') {
          web3Provider = makeWeb3Provider(wallet)
        }

        log.info('initWalletAndStorage wallet ready', { type, seedOrWeb3 })

        const storage = new UserStorage(wallet, db, new UserProperties(db))
        const loginAndWatch = shouldLoginAndWatch()

        await storage.ready

        if (loginAndWatch) {
          await doLogin(wallet, storage, false)
        }

        if (isLoggedInRouter) {
          await storage.initRegistered()

          if (loginAndWatch) {
            const { userProperties } = storage

            // only if user signed up then we can await for his properties
            // (because otherwise he wont have valid mongodb jwt)
            await userProperties.ready
          }
        }

        log.info('initWalletAndStorage storage done')

        global.userStorage = storage
        global.wallet = wallet
        setWalletAndStorage({ goodWallet: wallet, userStorage: storage, celowallet, fusewallet, web3Provider })
        log.info('initWalletAndStorage done', { web3Provider })
        return [wallet, storage]
      } catch (e) {
        log.error('failed initializing wallet and userstorage:', e.message, e)

        throw e
      }
    },
    [setWalletAndStorage, isLoggedInRouter],
  )

  // react to initial set of wallet in initWalletAndStorage
  useEffect(() => {
    if (goodWallet && userStorage) {
      updateWalletData(goodWallet)
      updateWalletListeners(goodWallet)
    }
  }, [goodWallet, userStorage])

  const doLogin = useCallback(
    async (wallet, storage, withRefresh = false) => {
      const walletLogin = new GoodWalletLogin(wallet, storage)

      const requestAuth = refresh =>
        walletLogin.auth(refresh).catch(exception => {
          if (refresh) {
            throw exception
          }

          // if no refresh was requested, retry with refresh
          return requestAuth(true)
        })

      try {
        // the login also re-initialize the api with new jwt
        const { jwt } = await requestAuth(withRefresh)

        setLoggedInJWT(walletLogin)
        log.info('walletLogin', { jwt, withRefresh })

        return walletLogin
      } catch (e) {
        log.error('failed auth:', e.message, e)

        // throw e
      }
    },
    [setLoggedInJWT],
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

      return doLogin(goodWallet, userStorage, refresh)
    },
    [goodWallet, userStorage, isLoggedInJWT, doLogin],
  )

  const getContractsNetwork = (network: 'fuse' | 'celo') => {
    network = network.toLowerCase()
    const env = Config.network.split('-')[0]

    let contractsNetwork
    switch (env) {
      default:
      case 'fuse':
      case 'development':
        contractsNetwork = network === 'fuse' ? 'fuse' : `development-${network}`
        break
      case 'staging':
        contractsNetwork = network === 'fuse' ? 'staging' : `${env}-${network}`
        break
      case 'production':
        contractsNetwork = network === 'fuse' ? 'production' : `${env}-${network}`
        break
    }
    return contractsNetwork
  }

  const switchNetwork = useCallback(
    async (network: NETWORK) => {
      network = network.toUpperCase()
      let contractsNetwork = getContractsNetwork(network)

      try {
        log.debug('switchNetwork:', { network, contractsNetwork })

        await goodWallet.setIsPollEvents(false) //stop watching prev chain events
        await goodWallet.init({ network: contractsNetwork }) //reinit wallet

        let web3Provider = makeWeb3Provider(goodWallet)

        setWalletAndStorage(_ => ({ ..._, goodWallet, web3Provider }))
        updateWalletData(goodWallet)
        updateWalletListeners(goodWallet)
      } catch (e) {
        log.error('switchNetwork failed:', e.message, e, { contractsNetwork, network })
      }
    },
    [goodWallet, userStorage],
  )

  useEffect(() => {
    if (login) {
      api.setLoginCallback(login)
    }
  }, [login])

  let contextValue = {
    userStorage,
    goodWallet,
    fusewallet,
    celowallet,
    initWalletAndStorage,
    login,
    isLoggedInJWT,
    ...balance,
    dailyUBI,
    isCitizen,
    switchNetwork,
  }

  let env = Config.network.split('-')[0] === 'development' ? 'fuse' : Config.network.split('-')[0]
  if (['fuse', 'staging', 'production'].includes(env) === false) {
    env = 'fuse'
  }

  // disable goodweb3provider for tests
  const Provider = Config.env === 'test' ? React.Fragment : GoodWeb3Provider
  const props =
    Config.env === 'test'
      ? {}
      : {
          web3Provider,
          env,
          config: {
            pollingInterval: 15000,
            networks: [Goerli, Mainnet, Fuse, Celo],
            readOnlyChainId: undefined,
            readOnlyUrls: {
              1: 'https://rpc.ankr.com/eth',
              122: 'https://rpc.fuse.io',
              42220: 'https://forno.celo.org',
            },
          },
        }
  return (
    <GoodWalletContext.Provider value={contextValue}>
      <Provider {...props}>{children}</Provider>
    </GoodWalletContext.Provider>
  )
}

export const useWeb3Provider = (wallet) => {
  const web3Provider = makeWeb3Provider(wallet);
  
  return web3Provider
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
  const { dailyUBI, balance, totalBalance, celoBalance, fuseBalance, isCitizen, goodWallet } = useContext(
    GoodWalletContext,
  )

  return {
    dailyUBI,
    balance,
    totalBalance,
    celoBalance,
    fuseBalance,
    isCitizen,
    networkExplorerUrl: Config.ethereum[goodWallet.networkId].explorer,
  }
}

export const useSwitchNetwork = () => {
  const { switchNetwork, goodWallet } = useContext(GoodWalletContext)

  return { switchNetwork, currentNetwork: getNetworkName(goodWallet.networkId) }
}

export const useSwitchNetworkModal = (toNetwork?: NETWORK, onDismiss = noop) => {
  toNetwork = toNetwork.toUpperCase()
  const { showDialog, hideDialog } = useDialog()
  const { currentNetwork, switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    const switchTo = toNetwork ?? currentNetwork === 'FUSE' ? 'CELO' : 'FUSE'

    if (switchTo !== currentNetwork) {
      showDialog({
        title: t`To continue please switch chains`,
        visible: true,
        type: 'info',
        isMinHeight: true,
        onDismiss,
        buttons: [
          {
            text: t`Switch to ${switchTo.toUpperCase()}`,
            onPress: async () => {
              await switchNetwork(switchTo)
              hideDialog()
            },
          },
        ],
      })
    }
  }, [toNetwork, currentNetwork])
}

export const useFormatG$ = () => {
  const wallet = useWallet()

  //using args so functions do not lose "this" context
  return {
    toDecimals: (...args) => wallet?.toDecimals(...args),
    fromDecimals: (...args) => wallet?.fromDecimals(...args),
  }
}

export const usePropSuffix = () => {
  const { goodWallet } = useContext(GoodWalletContext)
  const propSuffix = goodWallet.networkId === 122 ? '' : `_${goodWallet.networkId}`
  return propSuffix
}
