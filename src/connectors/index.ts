import { ChainId } from '@sushiswap/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from './NetworkConnector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { Web3Provider } from '@ethersproject/providers'

const RPC = {
    [ChainId.MAINNET]: 'https://eth-mainnet.alchemyapi.io/v2/q1gSNoSMEzJms47Qn93f9-9Xg5clkmEC',
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
    [122]: 'https://rpc.fuse.io'
}

export const network = new NetworkConnector({
    defaultChainId: 42,
    urls: RPC
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
    return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
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
        [122]: RPC[122]
    },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    pollingInterval: 15000
})

export const Fortmatic = {}
export const fortmatic = {}
export const Portis = {}
export const portis = {}
