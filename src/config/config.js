import env from './env'
const publicUrl = (window && window.location && window.location.origin) || process.env.REACT_APP_PUBLIC_URL

const Config = {
  env: env.REACT_APP_ENV || 'development',
  version: env.VERSION || 'v0',
  newVersionUrl: env.REACT_APP_NEW_VERSION_URL || 'https://gdlr.info/newversion',
  mnemonicToSeed: env.REACT_APP_MNEMONIC_TO_SEED || true,
  logLevel: env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: env.REACT_APP_SERVER_URL || 'http://localhost:3003',
  gunPublicUrl: env.REACT_APP_GUN_PUBLIC_URL || 'http://localhost:3003/gun',
  web3SiteUrl: env.REACT_APP_WEB3_SITE_URL || 'https://w3.gooddollar.org',
  web3SiteUrlEconomyEndpoint: env.REACT_APP_WEB3_SITE_URL_ECONOMY_ENDPOINT || '/learn/economy',
  publicUrl,
  infuraKey: env.REACT_APP_INFURA_KEY,
  network: env.REACT_APP_NETWORK || 'fuse',
  market: env.REACT_APP_MARKET || env.REACT_APP_ETORO || env.REACT_APP_NETWORK === 'etoro',
  marketUrl: env.REACT_APP_MARKET_URL || 'https://etoro.paperclip.co',
  isEToro: env.REACT_APP_ETORO === 'true' || env.REACT_APP_NETWORK === 'etoro',
  zoomLicenseKey: env.REACT_APP_ZOOM_LICENSE_KEY,
  amplitudeKey: env.REACT_APP_AMPLITUDE_API_KEY,
  httpWeb3provider: env.REACT_APP_WEB3_RPC,
  web3TransportProvider: env.REACT_APP_WEB3_TRANSPORT_PROVIDER || 'WebSocketProvider',
  recaptcha: '6LeOaJIUAAAAAKB3DlmijMPfX2CBYsve3T2MwlTd',
  skipEmailVerification: env.REACT_APP_SKIP_EMAIL_VERIFICATION === 'true',
  skipMobileVerification: env.REACT_APP_SKIP_MOBILE_VERIFICATION === 'true',
  throwSaveProfileErrors:
    !env.REACT_APP_THROW_SAVE_PROFILE_ERRORS || env.REACT_APP_THROW_SAVE_PROFILE_ERRORS === 'true',
  withMockedFeeds: env.REACT_APP_WITH_MOCKED_FEEDS === 'true',
  safariMobileKeyboardGuidedSize: env.REACT_APP_SAFARI_MOBILE_KEYBOARD_GUIDED_SIZE === 'true',
  receiveUrl: env.REACT_APP_RECEIVE_URL || `${publicUrl}`,
  sendUrl: env.REACT_APP_SEND_URL || `${publicUrl}`,
  nextTimeClaim: env.REACT_APP_NEXT_TIME_CLAIM || 86400,
  displayStartClaimingCardTime: env.REACT_APP_DISPLAY_START_CLAIMING_CARD_TIME || 3 * 24 * 60 * 60 * 1000, // 3 days
  bugsnagKey: env.REACT_APP_BUGSNAG_API_KEY,
  backgroundReqsInterval: env.REACT_APP_BACKGROUND_REQS_INTERVAL || 10, // minutes
  sentryDSN: env.REACT_APP_SENTRY_DSN,
  hanukaStartDate: env.REACT_APP_HANUKA_START_DATE, // date
  hanukaEndDate: env.REACT_APP_HANUKA_END_DATE, // date
  delayMessageNetworkDisconnection: env.REACT_APP_DELAY_MSG_NETWORK_DISCONNECTION || 3000,
  ethereum: {
    '42': {
      network_id: 42,
      httpWeb3provider: 'https://kovan.infura.io/v3/',
      websocketWeb3Provider: 'wss://kovan.infura.io/ws',
    },
    '3': {
      network_id: 3,
      httpWeb3provider: 'https://ropsten.infura.io/v3/',
      websocketWeb3Provider: 'wss://ropsten.infura.io/ws',
    },
    '121': {
      network_id: 121,
      httpWeb3provider: 'https://rpc.fuse.io/',
      websocketWeb3Provider: 'wss://rpc.fuse.io/ws',
    },
    '122': {
      network_id: 122,
      httpWeb3provider: 'https://rpc.fuse.io/',
      websocketWeb3Provider: 'wss://rpc.fuse.io/ws',
    },
    '4447': {
      network_id: 4447,
      httpWeb3provider: 'http://localhost:9545/',
      websocketWeb3Provider: 'ws://localhost:9545/ws',
    },
  },
  nodeEnv: env.NODE_ENV,
}

Config.web3SiteUrlEconomyPage = `${Config.web3SiteUrl}${Config.web3SiteUrlEconomyEndpoint}`

global.config = Config

// Forcing value as number, if not MNID encoder/decoder may fail
// Config.networkId = Config.ethereum[Config.networkId].network_id
export default Config
