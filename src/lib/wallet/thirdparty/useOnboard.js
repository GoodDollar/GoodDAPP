import { useMemo } from 'react'
import { init, useConnectWallet, useSetChain } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import gooddollarLogo from '../../../assets/fonts/gooddollarLogo.svg' //raw svg, assets/fonts folder excluded in webpack from svgr transform
import { chains } from './ThirdPartyWalletProvider'

// initialize the module with options
const walletConnect = walletConnectModule({})
const injected = injectedModule()

init({
  wallets: [injected, walletConnect],
  chains,
  appMetadata: {
    name: 'GoodDollar',
    icon: gooddollarLogo, // needs to be raw svg string icon
    description: 'Free crypto universal basic income',

    // url to a getting started guide for app
    gettingStartedGuide: 'https://gooddollar.org',

    // url that points to more information about app
    explore: 'https://gooddollar.org',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Zengo', url: 'https://zengo.com/getzengo/' },
    ],
  },
  accountCenter: {
    desktop: {
      position: 'topRight',
      enabled: true,
      minimal: true,
    },
    mobile: {
      position: 'bottomLeft',
      enabled: true,
      minimal: true,
    },
  },
})

export const useOnboard = () => {
  const [chainInfo, setChain] = useSetChain()

  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
    // updateBalances, // function to be called with an optional array of wallet addresses connected through Onboard to update balance or empty/no params to update all connected wallets
    // setWalletModules, // function to be called with an array of wallet modules to conditionally allow connection of wallet types i.e. setWalletModules([ledger, trezor, injected])
  ] = useConnectWallet()

  const isValidChain = useMemo(
    () => chainInfo?.chains && chainInfo?.chains.find(c => c.id === chainInfo.connectedChain?.id),
    [chainInfo],
  )

  const { connectedChain } = chainInfo || {}
  const { accounts, provider } = wallet || {}

  return {
    connect,
    disconnect,
    connectedChain: Number(connectedChain?.id),
    isValidChain,
    connecting,
    accounts: (accounts || []).map(_ => _.address),
    provider,
    setChain,
    walletName: wallet?.label,
  }
}
