import { ChainId } from '@sushiswap/sdk'
import { NetworkConnector } from './NetworkConnector'
import { Web3Provider } from '@ethersproject/providers'
import LogoSmall from '../assets/images/logosmall.png' 

// ** blocknative update ** //
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import walletLinkModule from '@web3-onboard/walletlink'
import { init } from '@web3-onboard/react'
import zenGoModule from './Zengo/'
// ** blockNative update **//

export enum AdditionalChainIds {
  FUSE = 122,
  ETH = 1
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
    [AdditionalChainIds.FUSE]: process.env.REACT_APP_FUSE_RPC ?? 'https://rpc.fuse.io'
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

export const Fortmatic = {}
export const fortmatic = {}
export const Portis = {}
export const portis = {}


// ** blocknative update ** //
const injectedBN = injectedModule({
  filter: {
    ["Binance Smart Wallet"]: false,
    ["MetaMask"]: true,
    ["Coinbase Wallet"]: false,
    ["detected"]: true,
    ["trust"]: false,
    ["opera"]: false,
    ["status"]: false,
    ["alphawallet"]: false,
    ["atoken"]: false,
    ["bitpie"]: false,
    ["blockwallet"]: false,
    ["Brave"]: false,
    ["dcent"]: false,
    ["frame"]: false,
    ["huobiwallet"]: false,
    ["hyperpay"]: false,
    ["imtoken"]: false,
    ["liquality"]: false,
    ["meetone"]: false,
    ["ownbit"]: false,
    ["mykey"]: false,
    ["tokenpocket"]: false,
    ["tp"]: false,
    ["xdefi"]: false,
    ["oneInch"]: false,
    ["tokenary"]: false,
    ["tally"]: false,

  }
})

const walletConnectBN = walletConnectModule({
  bridge: 'https://bridge.walletconnect.org',
  qrcodeModalOptions: {
    mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
  }
})

const zenGoBN = zenGoModule({
  bridge: 'https://bridge.walletconnect.org',
  qrcodeModalOptions: {
    desktopLinks: ['zengo', 'metamask'],
    mobileLinks: ['metamask', 'zengo'] // TODO: has to be tested on IOS, android does not show list
  }
})

// const walletLink = walletLinkModule({ darkMode: true })

export const onboard = init({
  wallets: [injectedBN, walletConnectBN, zenGoBN],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: process.env.REACT_APP_MAINNET_RPC ?? 'https://eth-mainnet.alchemyapi.io/v2/2kSbx330Sc8S3QRwD9nutr9XST_DfeJh'
    },
    {
      id: '0x2a',
      token: 'ETH',
      label: 'Kovan',
      rpcUrl: process.env.REACT_APP_KOVAN_RPC ?? 'https://kovan.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc'
    },
    {
      id: '0x3',
      token: 'ETH',
      label: 'Ropsten',
      rpcUrl: process.env.REACT_APP_ROPSTEN_RPC ?? 'https://ropsten.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc'
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
    icon: LogoSmall,
    description: 'GoodDollar Swap Interface',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io'}
    ]
  },
  accountCenter: {
    desktop: {
      enabled: false,
    }
  },
  i18n: {
    en: {
      "connect": {
        "selectingWallet": {
          "header": 'Connect Wallet',
          "sidebar": {
            "heading": '',
            "subheading": "Select your wallet",
            "paragraph": "Connecting your wallet is like “logging in” to Web3. Select your wallet from the options available."
          },
          "recommendedWalletsPart1": "{app} only supports",
          "recommendedWalletsPart2": "on this platform. Please use or install one of the supported wallets to continue",
          "installWallet": "You do not have any wallets installed that {app} supports, please use a supported wallet",
          "agreement": {
            "agree": "I agree to the",
            "terms": "Terms & Conditions",
            "and": "and",
            "privacy": "Privacy Policy"
          }
        },
        "connectingWallet": {
          "header": "Connect Wallet",
          "sidebar": {
            "subheading": "Approve Connection",
            "paragraph": "Please approve the connection in your wallet and authorize access to continue."
          },
          "mainText": "Connecting...",
          "paragraph": "Make sure to select all accounts that you want to grant access to.",
          "rejectedText": "Connection Rejected!",
          "rejectedCTA": "Click here to try again",
          "primaryButton": "Back to wallets"
        },
        "connectedWallet": {
          "header": "Connect Wallet",
          "sidebar": {
            "subheading": "Connection Successful!",
            "paragraph": "Your wallet is now connected to {app}"
          },
          "mainText": "Connected"
        }
      },
      "modals": {
        "actionRequired": {
          "heading": "Action required in {wallet}",
          "paragraph": "Please switch the active account in your wallet.",
          "linkText": "Learn more.",
          "buttonText": "Okay"
        },
        "switchChain": {
          "heading": "Switch Chain",
          "paragraph1": "{app} requires that you switch your wallet to the {nextNetworkName} network to continue.",
          "paragraph2": "*Some wallets may not support changing networks. If you can not change networks in your wallet you may consider switching to a different wallet."
        },
        "confirmDisconnectAll": {
          "heading": "Disconnect all Wallets",
          "description": "Are you sure that you would like to disconnect all your wallets?",
          "confirm": "Confirm",
          "cancel": "Cancel"
        }
      },
      "accountCenter": {
        "connectAnotherWallet": "Connect another Wallet",
        "disconnectAllWallets": "Disconnect all Wallets",
        "currentNetwork": "Current Network",
        "appInfo": "App Info",
        "learnMore": "Learn More",
        "gettingStartedGuide": "Getting Started Guide",
        "smartContracts": "Smart Contract(s)",
        "explore": "Explore",
        "backToApp": "Back to App",
        "poweredBy": "powered by",
        "addAccount": "Add Account",
        "setPrimaryAccount": "Set Primary Account",
        "disconnectWallet": "Disconnect Wallet"
      }
    }
  }
})

// TODO: Add localization
// ** blocknative update **//