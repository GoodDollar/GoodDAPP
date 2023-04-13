// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { RadioButton } from 'react-native-paper'
import { View } from 'react-native'
import { noop } from 'lodash'
import PrivateKeyProvider from 'truffle-privatekey-provider'
import { Web3Provider } from '@ethersproject/providers'
import { Celo, Fuse, Web3Provider as GoodWeb3Provider } from '@gooddollar/web3sdk-v2'
import { Goerli, Mainnet } from '@usedapp/core'

import Config from '../../config/config'
import logger from '../logger/js-logger'
import GoodWalletLogin from '../login/GoodWalletLoginClass'
import { UserStorage } from '../userStorage/UserStorageClass'
import UserProperties from '../userStorage/UserProperties'
import getDB from '../realmdb/RealmDB'
import usePropsRefs from '../hooks/usePropsRefs'
import { GlobalTogglesContext } from '../contexts/togglesContext'
import { getNetworkName, type NETWORK } from '../constants/network'
import { useDialog } from '../dialog/useDialog'
import Section from '../../components/common/layout/Section'
import Text from '../../components/common/view/Text'
import { withStyles } from '../styles'
import { theme } from '../../components/theme/styles'
import { GoodWallet } from './GoodWalletClass'
import { supportsG$UBI } from './utils'

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
  const [{ goodWallet, userStorage, fusewallet, celowallet, web3Provider }, setWalletAndStorage] = useState({})
  const [isLoggedInJWT, setLoggedInJWT] = useState()
  const [balance, setBalance] = useState({ totalBalance: '0', balance: '0', fuseBalance: '0', celoBalance: '0' })
  const [dailyUBI, setDailyUBI] = useState('0')
  const [isCitizen, setIsCitizen] = useState()
  const [shouldLoginAndWatch] = usePropsRefs([disableLoginAndWatch === false])

  const db = getDB()

  const update = useCallback(
    async goodWallet => {
      const { tokenContract, UBIContract, identityContract, account, networkId } = goodWallet

      // TODO: a) get balance b) default values if no UBI
      if (!supportsG$UBI(networkId)) {
        log.debug('Network does not supports G$, skipping update', { networkId })
        return
      }

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
      setBalance({ balance, totalBalance, fuseBalance: fuseBalance.toFixed(2), celoBalance: celoBalance.toFixed(2) })

      setDailyUBI(ubi)
      setIsCitizen(isCitizen)
    },
    [setBalance, setDailyUBI, setIsCitizen, fusewallet, celowallet],
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
          web3Provider = new Web3Provider(
            new PrivateKeyProvider(wallet.wallet.eth.accounts.wallet[0].privateKey, wallet.wallet._provider.host),
          )
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

  const getContractsNetwork = (network: NETWORK) => {
    const net = network.toLowerCase()
    const env = Config.network.split('-')[0]

    switch (env) {
      case 'production':
        return net === 'fuse' ? 'production' : `${env}-${net}`
      case 'staging':
        return net === 'fuse' ? 'staging' : `${env}-${net}`
      case 'fuse':
      case 'development':
      default:
        return net === 'fuse' ? 'fuse' : `development-${net}`
    }
  }

  const switchNetwork = useCallback(
    async (switchToNetwork: NETWORK) => {
      const network = switchToNetwork.toUpperCase()
      let contractsNetwork = getContractsNetwork(network)

      try {
        log.debug('switchNetwork:', { network, contractsNetwork })

        await goodWallet.setIsPollEvents(false) //stop watching prev chain events
        await goodWallet.init({ network: contractsNetwork }) //reinit wallet

        const lastBlock =
          userStorage.userProperties.get('lastBlock_' + goodWallet.networkId) ||
          Config.ethereum[goodWallet.networkId].startBlock

        log.debug('switchNetwork: starting watchBalanceAndTXs', { lastBlock, network, contractsNetwork })

        // goodWallet.watchEvents(parseInt(lastBlock), toBlock =>
        //   userStorage.userProperties.set('lastBlock_' + goodWallet.networkId, parseInt(toBlock)),
        // )

        const web3Provider = new Web3Provider(
          new PrivateKeyProvider(goodWallet.wallet.eth.accounts.wallet[0].privateKey, goodWallet.wallet._provider.host),
        )

        // trigger refresh
        setWalletAndStorage(_ => ({ ..._, goodWallet, web3Provider }))
        log.debug('switchNetwork: setWalletAndStorage done', { contractsNetwork, network })
      } catch (e) {
        log.error('switchNetwork failed:', e.message, e, { contractsNetwork, network })
      }
    },
    [goodWallet, userStorage],
  )

  useEffect(() => {
    if (goodWallet) {
      const lastBlock =
        userStorage.userProperties.get('lastBlock_' + goodWallet.networkId) ||
        Config.ethereum[goodWallet.networkId].startBlock

      log.debug('wallet changed: starting watchBalanceAndTXs', { lastBlock })

      goodWallet.watchEvents(parseInt(lastBlock), toBlock =>
        userStorage.userProperties.set('lastBlock_' + goodWallet.networkId, parseInt(toBlock)),
      )

      goodWallet.balanceChanged(() => update(goodWallet))

      update(goodWallet) // update global data whenever wallets/network changes
    }
  }, [celowallet, fusewallet, goodWallet])

  let contextValue = {
    userStorage,
    goodWallet,
    initWalletAndStorage,
    login,
    isLoggedInJWT,
    ...balance,
    dailyUBI,
    isCitizen,
    switchNetwork,
  }

  const env = Config.network.split('-')[0] === 'development' ? 'fuse' : Config.network.split('-')[0]
  return (
    <GoodWalletContext.Provider value={contextValue}>
      <GoodWeb3Provider
        web3Provider={web3Provider}
        env={env}
        config={{
          pollingInterval: 15000,
          networks: [Goerli, Mainnet, Fuse, Celo],
          readOnlyChainId: undefined,
          readOnlyUrls: {
            1: 'https://rpc.ankr.com/eth',
            122: 'https://rpc.fuse.io',
            42220: 'https://forno.celo.org',
          },
        }}
      >
        {children}
      </GoodWeb3Provider>
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

const NetworkSwitch = withStyles(({ theme }) => ({
  optionsRowWrapper: {
    padding: 0,
  },
  optionsRowContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderStyle: 'solid',
    borderBottomColor: theme.colors.lightGray,
    borderBottomWidth: 1,
    padding: theme.paddings.mainContainerPadding,
  },
  growTwo: {
    flexGrow: 2,
  },
  optionsRowTitle: {
    alignItems: 'center',
    paddingRight: theme.sizes.default,
  },
}))(({ value, onChange, styles }) => {
  const [network, setNetwork] = useState(value)
  const networks = ['fuse', 'celo', Config.env === 'production' ? 'mainnet' : 'goerli']

  const handleNetworkSelect = useCallback(
    selectedValue => {
      setNetwork(selectedValue)
      onChange(selectedValue)
    },
    [setNetwork, onChange],
  )

  return (
    <Section.Stack justifyContent="flex-start" style={styles.optionsRowWrapper}>
      <RadioButton.Group onValueChange={handleNetworkSelect} value={network}>
        {networks.map(network => (
          <View style={styles.optionsRowContainer} key={network}>
            <View style={styles.optionsRowTitle}>
              <RadioButton value={network} uncheckedColor={theme.colors.gray} color={theme.colors.primary} />
            </View>
            <Text style={styles.growTwo} textAlign="left" color="gray" fontWeight="medium">
              {network.toUpperCase()}
            </Text>
          </View>
        ))}
      </RadioButton.Group>
    </Section.Stack>
  )
})

export const useSwitchNetworkModal = (switchToNetwork?: NETWORK, onDismiss = noop) => {
  const { deltaWallet } = Config
  const { showDialog, hideDialog } = useDialog()
  const { currentNetwork, switchNetwork } = useSwitchNetwork()
  const toNetwork = switchToNetwork?.toUpperCase()
  const defaultSwitchTo = deltaWallet ? currentNetwork : currentNetwork === 'FUSE' ? 'CELO' : 'FUSE'

  const showModal = useCallback(
    (toNetwork = null) => {
      let switchTo = toNetwork ?? defaultSwitchTo
      const showSwitch = deltaWallet && !toNetwork

      showDialog({
        title: showSwitch ? 'Select chain' : 'To continue please switch chains',
        visible: true,
        type: 'info',
        isMinHeight: true,
        onDismiss,
        content: showSwitch ? <NetworkSwitch value={switchTo} onChange={value => (switchTo = value)} /> : null,
        buttons: [
          {
            text: showSwitch ? 'Switch chain' : `Switch to ${switchTo.toUpperCase()}`,
            onPress: async () => {
              await switchNetwork(switchTo)
              hideDialog()
            },
          },
        ],
      })
    },
    [showDialog, onDismiss, hideDialog, switchNetwork, defaultSwitchTo],
  )

  const selectNetwork = useCallback(() => showModal(), [showModal])

  useEffect(() => {
    if (toNetwork && toNetwork !== currentNetwork) {
      showModal(toNetwork)
    }
  }, [toNetwork, currentNetwork])

  return toNetwork ? null : selectNetwork
}

export const useFormatG$ = () => {
  const wallet = useWallet()

  //using args so functions do not lose "this" context
  return {
    toDecimals: (...args) => wallet.toDecimals(...args),
    fromDecimals: (...args) => wallet.fromDecimals(...args),
  }
}

export const usePropSuffix = () => {
  const { goodWallet } = useContext(GoodWalletContext)
  const propSuffix = goodWallet.networkId === 122 ? '' : `_${goodWallet.networkId}`
  return propSuffix
}
