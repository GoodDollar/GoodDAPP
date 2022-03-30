import { ChainId } from '@sushiswap/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from './NetworkConnector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { Web3Provider } from '@ethersproject/providers'
import Logo from '../assets/images/logo.png' 

// ** blocknative update ** //
import Onboard from '@web3-onboard/core'
import injectedModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import walletLinkModule from '@web3-onboard/walletlink'
import type { InitOptions } from '@web3-onboard/core'
// ** blockNative update **//
import { init } from '@web3-onboard/react'

enum NewChainId {
  FUSE = 122
}
const RPC = {
    [ChainId.MAINNET]: process.env.REACT_APP_MAINNET_RPC ?? 'https://eth-mainnet.alchemyapi.io/v2/2kSbx330Sc8S3QRwD9nutr9XST_DfeJh',
    [ChainId.ROPSTEN]: 'https://eth-ropsten.alchemyapi.io/v2/cidKix2Xr-snU3f6f6Zjq_rYdalKKHmW',
    [ChainId.RINKEBY]: 'https://eth-rinkeby.alchemyapi.io/v2/XVLwDlhGP6ApBXFz_lfv0aZ6VmurWhYD',
    [ChainId.GÖRLI]: 'https://eth-goerli.alchemyapi.io/v2/Dkk5d02QjttYEoGmhZnJG37rKt8Yl3Im',
    [ChainId.KOVAN]: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    [ChainId.FANTOM]: 'https://rpcapi.fantom.network',
    [ChainId.FANTOM_TESTNET]: 'https://rpc.testnet.fantom.network',
    [ChainId.MATIC]: 'https://rpc-mainnet.maticvigil.com',
    //'https://matic-mainnet.chainstacklabs.com/',
    [ChainId.MATIC_TESTNET]: 'https://rpc-mumbai.matic.today',
    [ChainId.XDAI]: 'https://rpc.xdaichain.com',
    [ChainId.BSC]: 'https://bsc-dataseed.binance.org/',
    [ChainId.BSC_TESTNET]: 'https://data-seed-prebsc-2-s3.binance.org:8545',
    [ChainId.MOONBASE]: 'https://rpc.testnet.moonbeam.network',
    [ChainId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
    [ChainId.FUJI]: 'https://api.avax-test.network/ext/bc/C/rpc',
    [ChainId.HECO]: 'https://http-mainnet.hecochain.com',
    [ChainId.HECO_TESTNET]: 'https://http-testnet.hecochain.com',
    [ChainId.HARMONY]: 'https://explorer.harmony.one',
    [ChainId.HARMONY_TESTNET]: 'https://explorer.pops.one',
    [ChainId.OKEX]: 'https://exchainrpc.okex.org',
    [ChainId.OKEX_TESTNET]: 'https://exchaintestrpc.okex.org',
    [NewChainId.FUSE]: process.env.REACT_APP_FUSE_RPC ?? 'https://rpc.fuse.io'
}

export const network = new NetworkConnector({
    defaultChainId: 42,
    urls: RPC
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  const [{provider}] = onboard.state.get().wallets
  return (networkLibrary = networkLibrary ?? new Web3Provider(provider as any))
}

export const injected = new InjectedConnector({
    supportedChainIds: [42, 122, 3, 1]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
    rpc: {
        [ChainId.MAINNET]: RPC[ChainId.MAINNET],
        [ChainId.ROPSTEN]: RPC[ChainId.ROPSTEN],
        [ChainId.KOVAN]: RPC[ChainId.KOVAN],
        [NewChainId.FUSE]: RPC[NewChainId.FUSE]
    },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    pollingInterval: 15000
})

export const walletlink = new WalletLinkConnector({
  url: RPC[ChainId.MAINNET],
  appName: 'GoodDollar',
  appLogoUrl: Logo,
  darkMode: true,
})

export const Fortmatic = {}
export const fortmatic = {}
export const Portis = {}
export const portis = {}


// ** blocknative update ** //
const injectedBN = injectedModule({
  filter: {
    ["Binance Smart Wallet"]: false,
    ["Coinbase Wallet"]: false // if supported, use walletLink module for coinbase
  }
})

const walletConnectBN = walletConnectModule({
  bridge: 'https://bridge.walletconnect.org',
  qrcodeModalOptions: {
    mobileLinks: ['metamask', 'trust']
  }
})

const walletLink = walletLinkModule({ darkMode: true })

export const onboard = init({
  wallets: [injectedBN, walletConnectBN],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: process.env.REACT_APP_MAINNET_RPC ?? 'https://eth-mainnet.alchemyapi.io/v2/2kSbx330Sc8S3QRwD9nutr9XST_DfeJh'
    },
    {
      id: '0x7a',
      token: 'FUSE',
      label: 'Fuse Network',
      rpcUrl: process.env.REACT_APP_FUSE_RPC ?? 'https://fuse-mainnet.gateway.pokt.network/v1/lb/6238bcde27bdef003b45720c'
    }
  ],
  appMetadata: {
    name: 'GoodSwap',
    icon: Logo,
    description: 'GoodDollar Swap Interface',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io'}
    ]
  },
  i18n: {
    en: {
      connect: {
        selectingWallet: {
          header: 'Testing blocknative',
          sidebar: {
            heading: "Get Started",
            subheading: "Connect your wallet",
            paragraph: "Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started."
          },
        },
        connectingWallet: {
          header: "{connectionRejected, select, false {Connecting to {wallet}...} other {Connection Rejected}}",
          sidebar: {
            heading: "This is heading",
            subheading: "Approve Connection",
            paragraph: "Please approve the connection in your wallet and authorize access to continue."
          },
          mainText: "Connecting...",
          paragraph: "Make sure to select all accounts that you want to grant access to.",
          rejectedText: "Connection Rejected!",
          rejectedCTA: "Click here to try again",
          primaryButton: "Back to wallets"
        },
        connectedWallet: {
          header: "Connection Successful",
          sidebar: {
            heading: "This is heading",
            subheading: "Connection Successful!",
            paragraph: "Your wallet is now connected to {app}"
          },
          mainText: "Connected"
        }
      }
    }
  }
})

// TODO: Add localization
// ** blocknative update **//