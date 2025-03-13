// @flow
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { assign, first, last, noop, trimEnd } from 'lodash'
import { Web3Provider } from '@ethersproject/providers'
import { Celo, Fuse, Web3Provider as GoodWeb3Provider } from '@gooddollar/web3sdk-v2'
import { Mainnet } from '@usedapp/core'
import { View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { t } from '@lingui/macro'
import { usePostHog } from 'posthog-react-native'

import usePromise from 'react-use-promise'

import AsyncStorage from '../utils/asyncStorage'
import Config from '../../config/config'
import logger from '../logger/js-logger'
import GoodWalletLogin from '../login/GoodWalletLoginClass'
import { UserStorage } from '../userStorage/UserStorageClass'
import UserProperties from '../userStorage/UserProperties'
import getDB from '../realmdb/RealmDB'
import usePropsRefs from '../hooks/usePropsRefs'
import { GlobalTogglesContext } from '../contexts/togglesContext'
import api from '../API/api'
import { getNetworkName, type NETWORK } from '../constants/network'
import { useDialog } from '../dialog/useDialog'
import Section from '../../components/common/layout/Section'
import Text from '../../components/common/view/Text'
import { setChainId } from '../analytics/analytics'
import { withStyles } from '../styles'
import { supportedCountries } from '../utils/supportedCountries'
import { useFlagWithPayload } from '../hooks/useFeatureFlags'
import { GoodWallet } from './GoodWalletClass'
import { JsonRpcProviderWithSigner } from './JsonRpcWithSigner'
import { decimalsToFixed, getTokensList, isNativeToken, supportedNetworks, supportsG$, supportsG$UBI } from './utils'

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
  dailyAltUBI: undefined,
  isCitizen: false,
  hasGoodIdEnabled: false,
  switchNetwork: undefined,
  web3Provider: undefined,
})

export const TokenContext = React.createContext({
  token: 'G$',
  native: false,
  balance: '0',
  setToken(token) {},
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
  const [hasGoodIdEnabled, setHasGoodIdEnabled] = useState(false)
  const [shouldLoginAndWatch] = usePropsRefs([disableLoginAndWatch === false])
  const posthog = usePostHog()
  const { enabled = false, countries = '', whitelist = undefined } = useFlagWithPayload('uat-goodid-flow') ?? {}

  const [isEligible] = usePromise(
    () => supportedCountries(countries, whitelist, goodWallet?.account, enabled),
    [countries, whitelist, goodWallet?.account, enabled],
  )

  const db = getDB()

  const updateWalletData = useCallback(
    async goodWallet => {
      const { tokenContract, UBIContract, identityContract, account, networkId, multicallCurrent } = goodWallet
      const calls = []

      if (supportsG$(networkId) && tokenContract) {
        calls.push({
          balance: tokenContract.methods.balanceOf(account),
        })
      }

      if (supportsG$UBI(networkId)) {
        if (UBIContract) {
          calls.push({
            ubi: UBIContract.methods.checkEntitlement(account),
          })
        }

        if (identityContract) {
          calls.push({
            isCitizen: identityContract.methods.isWhitelisted(account),
          })
        }
      }

      // eslint-disable-next-line require-await
      const onFallback = async () => [[{}]]

      // entitelment is separate because it depends on msg.sender
      const [[{ balance = 0 }, ...results]] = await (calls.length
        ? multicallCurrent.all([calls]).catch(onFallback)
        : onFallback())
      const { ubi = 0 } = first(results) || {}
      const { isCitizen = false } = last(results) || {}

      let totalBalance = balance
      let fuseBalance = 0
      let celoBalance = 0

      if (fusewallet && celowallet) {
        ;[fuseBalance = '0', celoBalance = '0'] = await Promise.all([fusewallet?.balanceOf(), celowallet?.balanceOf()])

        fuseBalance = Number(fusewallet.toDecimals(fuseBalance))
        celoBalance = Number(celowallet.toDecimals(celoBalance))
        totalBalance = (fuseBalance + celoBalance).toFixed(2)
      }

      const walletData = {
        balance,
        totalBalance,
        fuseBalance: fuseBalance.toFixed(2),
        celoBalance: celoBalance.toFixed(2),
      }

      log.debug('updateWalletData', { walletData })
      setBalance(walletData)
      setIsCitizen(isCitizen)
      setDailyUBI(ubi)
    },
    [setBalance, setDailyUBI, setIsCitizen, fusewallet, celowallet],
  )

  const updateWalletListeners = useCallback(
    goodWallet => {
      const { networkId, account } = goodWallet
      const lastBlock = userStorage.userProperties.get('lastBlock_' + networkId)

      log.debug('updateWalletListeners', { lastBlock })

      goodWallet.watchEvents(lastBlock ? parseInt(lastBlock) : undefined, toBlock =>
        userStorage.userProperties.set('lastBlock_' + networkId, parseInt(toBlock)),
      )

      // set/update wallet data/interface for the native txs feed
      assign(db, {
        account,
        onBalanceChanged() {
          goodWallet.notifyBalanceChanged()
        },
      })

      goodWallet.balanceChanged(() => updateWalletData(goodWallet))
      setChainId(goodWallet.networkId)
    },
    [userStorage],
  )

  const initWalletAndStorage = useCallback(
    async (seedOrWeb3, type: 'SEED' | 'METAMASK' | 'WALLETCONNECT' | 'OTHER', logMethod) => {
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

        if (logMethod) {
          await AsyncStorage.setItem('logMethod', logMethod)
        }

        setWalletAndStorage({
          goodWallet: wallet,
          userStorage: storage,
          celowallet,
          fusewallet,
          web3Provider,
        })
        log.info('initWalletAndStorage done', { web3Provider })
        return [wallet, storage]
      } catch (e) {
        log.error('failed initializing wallet and userstorage:', e.message, e)

        throw e
      }
    },
    [setWalletAndStorage, isLoggedInRouter, posthog],
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

  const getContractsNetwork = (network: NETWORK) => {
    const net = network.toLowerCase()
    const env = Config.network.split('-')[0]

    switch (env) {
      default:
      case 'fuse':
      case 'development':
        return net === 'fuse' ? 'fuse' : `development-${net}`
      case 'staging':
        return net === 'fuse' ? 'staging' : `${env}-${net}`
      case 'production':
        return net === 'fuse' ? 'production' : `${env}-${net}`
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

  useEffect(() => {
    if (isEligible) {
      setHasGoodIdEnabled(true)
    }
  }, [isEligible])

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
    hasGoodIdEnabled,
    switchNetwork,
    web3Provider,
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
            networks: [Mainnet, Fuse, Celo],
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
      <TokenProvider wallet={goodWallet} walletData={balance}>
        <Provider {...props}>{children}</Provider>
      </TokenProvider>
    </GoodWalletContext.Provider>
  )
}

const TokenProvider = ({ children, wallet, walletData }) => {
  const { networkId } = wallet ?? {}
  const [balance, setBalance] = useState(() => walletData.balance)
  const [tokenData, setTokenData] = useState(() => ({ token: 'G$', native: false }))

  const setToken = useCallback(
    token =>
      setTokenData({
        token,
        native: isNativeToken(token),
      }),
    [setTokenData, networkId],
  )

  useEffect(() => {
    setToken(first(getTokensList(networkId)))
  }, [networkId])

  useEffect(() => {
    if (!tokenData.native) {
      setBalance(walletData?.balance)
      return
    }

    if (!wallet) {
      return
    }

    const { account } = wallet

    const updateNativeBalance = async () => {
      log.debug('updateNativeBalance: fetching')

      try {
        const nativeBalance = await wallet.balanceOfNative()

        log.debug('updateNativeBalance: success', { nativeBalance, account })
        setBalance(nativeBalance)
      } catch (e) {
        log.warn('updateNativeBalance: Failed to fetch', e.message, e, { account })
      }
    }

    updateNativeBalance()
  }, [wallet, walletData, tokenData, setBalance])

  return <TokenContext.Provider value={{ ...tokenData, balance, setToken }}>{children}</TokenContext.Provider>
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
  const { dailyUBI, balance, totalBalance, celoBalance, fuseBalance, isCitizen, goodWallet } =
    useContext(GoodWalletContext)

  return {
    dailyUBI,
    dailyAltUBI: 0,
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

const PopupSwitch = withStyles(({ theme }) => ({
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
}))(({ value, values, onChange, styles, theme }) => {
  const [selectedValue, setSelected] = useState(value)

  const handleSelect = useCallback(
    selectedValue => {
      setSelected(selectedValue)
      onChange(selectedValue)
    },
    [setSelected, onChange],
  )

  return (
    <Section.Stack justifyContent="flex-start" style={styles.optionsRowWrapper}>
      <RadioButton.Group onValueChange={handleSelect} value={selectedValue}>
        {values.map(item => (
          <View style={styles.optionsRowContainer} key={item}>
            <View style={styles.optionsRowTitle}>
              <RadioButton value={item} uncheckedColor={theme.colors.gray} color={theme.colors.primary} />
            </View>
            <Text style={styles.growTwo} textAlign="left" color="gray" fontWeight="medium">
              {item}
            </Text>
          </View>
        ))}
      </RadioButton.Group>
    </Section.Stack>
  )
})

export const useSwitchNetworkModal = (switchToNetwork?: NETWORK, onDismiss = noop) => {
  const { isDeltaApp } = Config
  const { showDialog, hideDialog } = useDialog()
  const { currentNetwork, switchNetwork } = useSwitchNetwork()
  const toNetwork = switchToNetwork?.toUpperCase()
  const defaultSwitchTo = isDeltaApp ? currentNetwork : currentNetwork === 'FUSE' ? 'CELO' : 'FUSE'

  const showModal = useCallback(
    (toNetwork = null) => {
      let switchTo = toNetwork ?? defaultSwitchTo
      const showSwitch = isDeltaApp && !toNetwork

      showDialog({
        title: showSwitch ? t`Select chain` : t`To continue please switch chains`,
        visible: true,
        type: 'info',
        isMinHeight: true,
        onDismiss,
        content: showSwitch ? (
          <PopupSwitch values={supportedNetworks} value={switchTo} onChange={value => (switchTo = value)} />
        ) : null,
        buttons: [
          {
            text: showSwitch ? t`Switch chain` : t`Switch to ${switchTo.toUpperCase()}`,
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

export const useSwitchTokenModal = (onDismiss = noop) => {
  const { showDialog, hideDialog } = useDialog()
  const { networkId } = useWallet()
  const { token, setToken } = useContext(TokenContext)
  const tokens = useMemo(() => getTokensList(networkId), [networkId])

  return useCallback(() => {
    let switchTo = token

    showDialog({
      title: 'Select token',
      visible: true,
      type: 'info',
      isMinHeight: true,
      onDismiss,
      content: <PopupSwitch values={tokens} value={switchTo} onChange={value => (switchTo = value)} />,
      buttons: [
        {
          text: 'Select token',
          onPress: () => {
            setToken(switchTo)
            hideDialog()
          },
        },
      ],
    })
  }, [showDialog, onDismiss, hideDialog, token, tokens])
}

export const useFixedDecimals = (token = 'G$', chainId = null) => {
  const { toDecimals } = useFormatToken(token)
  const isFloat = number => Number(number) % 1 > 0
  const asDecimals = number => (isFloat(number) ? number : toDecimals(number, chainId))

  const format = isNativeToken(token)
    ? number => trimEnd(decimalsToFixed(asDecimals(number), 4), '0')
    : number => decimalsToFixed(asDecimals(number))

  return number => format(number) || '0.0'
}

export const useFormatToken = (token = 'G$') => {
  const wallet = useWallet()
  const isNative = isNativeToken(token)

  // using args so functions do not lose "this" context
  return {
    toDecimals: (wei, chainId = null) => wallet?.toDecimals(wei, isNative ? token : chainId),
    fromDecimals: (amount, chainId = null) => wallet?.fromDecimals(amount, isNative ? token : chainId),
  }
}

export const useFormatG$ = () => useFormatToken()

export const usePropSuffix = () => {
  const { goodWallet } = useContext(GoodWalletContext)
  const propSuffix = goodWallet.networkId === 122 ? '' : `_${goodWallet.networkId}`

  return propSuffix
}
