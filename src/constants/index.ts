import { ChainId, Currency, JSBI, Percent, Token, WETH } from '@sushiswap/sdk'

export const POOL_DENY = ['14', '29', '45', '30']

export const FUSE = Object.assign({}, Currency, {
    decimals: 18,
    symbol: 'FUSE',
    name: 'FUSE',
    getSymbol(chainId?: ChainId) {
        if (!chainId) {
            return this === null || this === void 0 ? void 0 : this.symbol
        }

        if ((this === null || this === void 0 ? void 0 : this.symbol) === 'FUSE') {
            return Currency.getNativeCurrencySymbol(chainId)
        }

        return this === null || this === void 0 ? void 0 : this.symbol
    },

    getName(chainId?: ChainId) {
        if (!chainId) {
            return this === null || this === void 0 ? void 0 : this.name
        }

        if ((this === null || this === void 0 ? void 0 : this.name) === 'FUSE') {
            return Currency.getNativeCurrencyName(chainId)
        }

        return this === null || this === void 0 ? void 0 : this.name
    },
}) as unknown as Currency

export const CELO = Object.assign({}, Currency, {
    decimals: 18,
    symbol: 'CELO',
    name: 'CELO',
    getSymbol(chainId?: ChainId) {
        if (!chainId) {
            return this === null || this === void 0 ? void 0 : this.symbol
        }

        if ((this === null || this === void 0 ? void 0 : this.symbol) === 'CELO') {
            return Currency.getNativeCurrencySymbol(chainId)
        }

        return this === null || this === void 0 ? void 0 : this.symbol
    },

    getName(chainId?: ChainId) {
        if (!chainId) {
            return this === null || this === void 0 ? void 0 : this.name
        }

        if ((this === null || this === void 0 ? void 0 : this.name) === 'CELO') {
            return Currency.getNativeCurrencyName(chainId)
        }

        return this === null || this === void 0 ? void 0 : this.name
    },
}) as unknown as Currency

Object.defineProperty(Currency.NATIVE, 122, { value: FUSE })
Object.defineProperty(Currency, 'FUSE', { value: FUSE })

Object.defineProperty(Currency.NATIVE, 42220, { value: CELO })
Object.defineProperty(Currency, 'CELO', { value: CELO })

Object.defineProperty(ChainId, 'FUSE', { value: 122, writable: false, configurable: false })
Object.defineProperty(ChainId, 122, { value: 'FUSE', writable: false, configurable: false })
Object.defineProperty(WETH, 122, {
    value: new Token(122, '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629', 18, 'WFUSE', 'Wrapped FUSE'),
    writable: false,
    configurable: false,
})

Object.defineProperty(ChainId, 'CELO', { value: 42220, writable: false, configurable: false })
Object.defineProperty(ChainId, 42220, { value: 'CELO', writable: false, configurable: false })
Object.defineProperty(WETH, 42220, {
    value: new Token(42220, '0x122013fd7dF1C6F636a5bb8f03108E876548b455', 18, 'WETH', 'Wrapped ETH'),
    writable: false,
    configurable: false,
})

export enum AdditionalChainId {
    FUSE = 122,
    CELO = 42220,
    //KOVAN = 42
}

export enum ChainIdHex {
    '0x7a' = 122,
    '0xa4ec' = 42220,
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId | AdditionalChainId]?: string } = {
    [ChainId.MAINNET]: '0xcBE6B83e77cdc011Cc18F6f0Df8444E5783ed982',
    [ChainId.ROPSTEN]: '0x84d1f7202e0e7dac211617017ca72a2cb5e2b955',
}

// Default Ethereum chain tokens
export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')
export const RUNE = new Token(ChainId.MAINNET, '0x3155BA85D5F96b2d030a4966AF206230e46849cb', 18, 'RUNE', 'RUNE.ETH')
export const NFTX = new Token(ChainId.MAINNET, '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776', 18, 'NFTX', 'NFTX')
export const STETH = new Token(ChainId.MAINNET, '0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D', 18, 'stETH', 'stakedETH')

export const BSC: { [key: string]: Token } = {
    DAI: new Token(ChainId.BSC, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 18, 'DAI', 'Dai Stablecoin'),
    USD: new Token(ChainId.BSC, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'Binance USD'),
    USDC: new Token(ChainId.BSC, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC', 'USD Coin'),
    USDT: new Token(ChainId.BSC, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Tether USD'),
    BTCB: new Token(ChainId.BSC, '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 18, 'BTCB', 'Bitcoin'),
}

export const FANTOM: { [key: string]: Token } = {
    USDC: new Token(ChainId.FANTOM, '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', 6, 'USDC', 'USD Coin'),
    WBTC: new Token(ChainId.FANTOM, '0x321162Cd933E2Be498Cd2267a90534A804051b11', 8, 'WBTC', 'Wrapped Bitcoin'),
    DAI: new Token(ChainId.FANTOM, '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', 18, 'DAI', 'Dai Stablecoin'),
    WETH: new Token(ChainId.FANTOM, '0x74b23882a30290451A17c44f4F05243b6b58C76d', 18, 'WETH', 'Wrapped Ether'),
}

export const MATIC: { [key: string]: Token } = {
    USDC: new Token(ChainId.MATIC, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'USDC', 'USD Coin'),
    WBTC: new Token(ChainId.MATIC, '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 8, 'WBTC', 'Wrapped Bitcoin'),
    DAI: new Token(ChainId.MATIC, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin'),
    WETH: new Token(ChainId.MATIC, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'WETH', 'Wrapped Ether'),
    USDT: new Token(ChainId.MATIC, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 'USDT', 'Tether USD'),
    TEL: new Token(ChainId.MATIC, '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32', 2, 'TEL', 'Telcoin'),
    SUSHI: new Token(ChainId.MATIC, '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a', 18, 'SUSHI', 'SushiToken'),
    AAVE: new Token(ChainId.MATIC, '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, 'AAVE', 'Aave'),
    FRAX: new Token(ChainId.MATIC, '0x104592a158490a9228070E0A8e5343B499e125D0', 18, 'FRAX', 'Frax'),
    FXS: new Token(ChainId.MATIC, '0x3e121107F6F22DA4911079845a470757aF4e1A1b', 18, 'FXS', 'Frax Share'),
}

export const CREAM = new Token(ChainId.MAINNET, '0x2ba592F78dB6436527729929AAf6c908497cB200', 18, 'CREAM', 'Cream')
export const BAC = new Token(ChainId.MAINNET, '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a', 18, 'BAC', 'Basis Cash')
export const FXS = new Token(ChainId.MAINNET, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 18, 'FXS', 'Frax Share')
export const ALPHA = new Token(ChainId.MAINNET, '0xa1faa113cbE53436Df28FF0aEe54275c13B40975', 18, 'ALPHA', 'AlphaToken')
export const USDP = new Token(
    ChainId.MAINNET,
    '0x1456688345527bE1f37E9e627DA0837D6f08C925',
    18,
    'USDP',
    'USDP Stablecoin'
)
export const DUCK = new Token(ChainId.MAINNET, '0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5', 18, 'DUCK', 'DUCK')
export const BAB = new Token(ChainId.MAINNET, '0xC36824905dfF2eAAEE7EcC09fCC63abc0af5Abc5', 18, 'BAB', 'BAB')
export const HBTC = new Token(ChainId.MAINNET, '0x0316EB71485b0Ab14103307bf65a021042c6d380', 18, 'HBTC', 'Huobi BTC')
export const FRAX = new Token(ChainId.MAINNET, '0x853d955aCEf822Db058eb8505911ED77F175b99e', 18, 'FRAX', 'FRAX')
export const IBETH = new Token(
    ChainId.MAINNET,
    '0xeEa3311250FE4c3268F8E684f7C87A82fF183Ec1',
    8,
    'ibETHv2',
    'Interest Bearing Ether v2'
)
export const PONT = new Token(
    ChainId.MAINNET,
    '0xcb46C550539ac3DB72dc7aF7c89B11c306C727c2',
    9,
    'pONT',
    'Poly Ontology Token'
)
export const PWING = new Token(
    ChainId.MAINNET,
    '0xDb0f18081b505A7DE20B18ac41856BCB4Ba86A1a',
    9,
    'pWING',
    'Poly Ontology Wing Token'
)

export const UMA = new Token(ChainId.MAINNET, '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828', 18, 'UMA', 'UMA')

export const UMA_CALL = new Token(
    ChainId.MAINNET,
    '0x1062aD0E59fa67fa0b27369113098cC941Dd0D5F',
    18,
    'UMA',
    'UMA 35 Call [30 Apr 2021]'
)

export const DOUGH = new Token(
    ChainId.MAINNET,
    '0xad32A8e6220741182940c5aBF610bDE99E737b2D',
    18,
    'DOUGH',
    'PieDAO Dough v2'
)

export const PLAY = new Token(
    ChainId.MAINNET,
    '0x33e18a092a93ff21aD04746c7Da12e35D34DC7C4',
    18,
    'PLAY',
    'Metaverse NFT Index'
)

export const XSUSHI_CALL = new Token(
    ChainId.MAINNET,
    '0xada279f9301C01A4eF914127a6C2a493Ad733924',
    18,
    'XSUc25-0531',
    'XSUSHI 25 Call [31 May 2021]'
)

export const XSUSHI = new Token(ChainId.MAINNET, '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272', 18, 'xSUSHI', 'SushiBar')
export const LIFT = new Token(ChainId.MAINNET, '0xf9209d900f7ad1DC45376a2caA61c78f6dEA53B6', 18, 'LIFT', 'LiftKitchen')
export const LFBTC = new Token(
    ChainId.MAINNET,
    '0xafcE9B78D409bF74980CACF610AFB851BF02F257',
    18,
    'LFBTC',
    'LiftKitchen BTC'
)
export const CVXCRV = new Token(ChainId.MAINNET, '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7', 18, 'cvxCRV', 'cvxCRV')
export const CRV = new Token(ChainId.MAINNET, '0xD533a949740bb3306d119CC777fa900bA034cd52', 18, 'CRV', 'Curve')

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId | AdditionalChainId]?: { [tokenAddress: string]: Token[] } } = {
    [ChainId.MAINNET]: {
        [AMPL.address]: [DAI, WETH[ChainId.MAINNET]],
        [DUCK.address]: [USDP, WETH[ChainId.MAINNET]],
        [BAB.address]: [BAC, WETH[ChainId.MAINNET]],
        [HBTC.address]: [CREAM, WETH[ChainId.MAINNET]],
        [FRAX.address]: [FXS, WETH[ChainId.MAINNET]],
        [IBETH.address]: [ALPHA, WETH[ChainId.MAINNET]],
        [PONT.address]: [PWING, WETH[ChainId.MAINNET]],
        [UMA_CALL.address]: [UMA, WETH[ChainId.MAINNET]],
        [PLAY.address]: [DOUGH, WETH[ChainId.MAINNET]],
        [XSUSHI_CALL.address]: [XSUSHI, WETH[ChainId.MAINNET]],
        [LIFT.address]: [LFBTC, WETH[ChainId.MAINNET]],
        [CVXCRV.address]: [CRV, WETH[ChainId.MAINNET]],
    },
    [ChainId.MATIC]: {
        [MATIC.TEL.address]: [MATIC.SUSHI, MATIC.AAVE],
        [MATIC.FXS.address]: [MATIC.FRAX],
    },
}

export interface WalletInfo {
    name: string
    iconName: string
    description: string
    href: string | null
    color: string
    primary?: true
    mobile?: true
    mobileOnly?: true
}

/*
 * Override to be used as cast for @ethers library.provider
 * added isWalletLink
 */
export type ExternalProvider = {
    isMetaMask?: boolean
    isWalletLink?: boolean
    isStatus?: boolean
    host?: string
    path?: string
    sendAsync?: (
        request: { method: string; params?: Array<any> },
        callback: (error: any, response: any) => void
    ) => void
    send?: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => void
    request?: (request: { method: string; params?: Array<any> }) => Promise<any>
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
    METAMASK: {
        name: 'MetaMask',
        iconName: 'metamask.png',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    },
    WALLET_CONNECT: {
        name: 'WalletConnect',
        iconName: 'walletConnectIcon.svg',
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#4196FC',
        mobile: true,
    },
    WALLET_LINK: {
        name: 'Coinbase',
        iconName: 'coinbaseWalletIcon.svg',
        description: 'Use Coinbase Wallet app on mobile device',
        href: null,
        color: '#315CF5',
    },
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
    '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
    '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
    '0x901bb9583b24D97e995513C6778dc6888AB6870e',
    '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
]

export const disableTestnetMain = [3, 42]
