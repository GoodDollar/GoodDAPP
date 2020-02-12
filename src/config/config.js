const publicUrl = process.env.REACT_APP_PUBLIC_URL || (window && window.location && window.location.origin)

const Config = {
  env: process.env.REACT_APP_ENV || 'development',
  version: process.env.VERSION || 'v0',
  newVersionUrl: process.env.REACT_APP_NEW_VERSION_URL || 'https://gdlr.info/newversion',
  mnemonicToSeed: process.env.REACT_APP_MNEMONIC_TO_SEED || true,
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: 'https://good-server.herokuapp.com',
  gunPublicUrl: 'https://goodgun-dev.herokuapp.com/gun',
  web3SiteUrl: process.env.REACT_APP_WEB3_SITE_URL || 'https://w3.gooddollar.org',
  web3SiteUrlEconomyEndpoint: process.env.REACT_APP_WEB3_SITE_URL_ECONOMY_ENDPOINT || '/learn/economy',
  publicUrl,
  infuraKey: process.env.REACT_APP_INFURA_KEY,
  network: 'fuse',
  market: process.env.REACT_APP_MARKET || process.env.REACT_APP_ETORO || process.env.REACT_APP_NETWORK === 'etoro',
  marketUrl: process.env.REACT_APP_MARKET_URL || 'https://etoro.paperclip.co',
  isEToro: process.env.REACT_APP_ETORO === 'true' || process.env.REACT_APP_NETWORK === 'etoro',
  zoomLicenseKey: process.env.REACT_APP_ZOOM_LICENSE_KEY,
  amplitudeKey: process.env.REACT_APP_AMPLITUDE_API_KEY,
  rollbarKey: process.env.REACT_APP_ROLLBAR_API_KEY,
  httpWeb3provider: process.env.REACT_APP_WEB3_RPC,
  web3TransportProvider: process.env.REACT_APP_WEB3_TRANSPORT_PROVIDER || 'WebSocketProvider',
  recaptcha: '6LeOaJIUAAAAAKB3DlmijMPfX2CBYsve3T2MwlTd',
  skipEmailVerification: process.env.REACT_APP_SKIP_EMAIL_VERIFICATION === 'true',
  skipMobileVerification: process.env.REACT_APP_SKIP_MOBILE_VERIFICATION === 'true',
  throwSaveProfileErrors:
    !process.env.REACT_APP_THROW_SAVE_PROFILE_ERRORS || process.env.REACT_APP_THROW_SAVE_PROFILE_ERRORS === 'true',
  withMockedFeeds: process.env.REACT_APP_WITH_MOCKED_FEEDS === 'true',
  safariMobileKeyboardGuidedSize: process.env.REACT_APP_SAFARI_MOBILE_KEYBOARD_GUIDED_SIZE === 'true',
  receiveUrl: process.env.REACT_APP_RECEIVE_URL || `${publicUrl}`,
  sendUrl: process.env.REACT_APP_SEND_URL || `${publicUrl}`,
  nextTimeClaim: process.env.REACT_APP_NEXT_TIME_CLAIM || 86400,
  displayStartClaimingCardTime: process.env.REACT_APP_DISPLAY_START_CLAIMING_CARD_TIME || 3 * 24 * 60 * 60 * 1000, // 3 days
  bugsnagKey: process.env.REACT_APP_BUGSNAG_API_KEY,
  backgroundReqsInterval: process.env.REACT_APP_BACKGROUND_REQS_INTERVAL || 10, // minutes
  sentryDSN: process.env.REACT_APP_SENTRY_DSN,
  hanukaStartDate: process.env.REACT_APP_HANUKA_START_DATE, // date
  hanukaEndDate: process.env.REACT_APP_HANUKA_END_DATE, // date
  delayMessageNetworkDisconnection: process.env.REACT_APP_DELAY_MSG_NETWORK_DISCONNECTION || 3000,
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
}

Config.web3SiteUrlEconomyPage = `${Config.web3SiteUrl}${Config.web3SiteUrlEconomyEndpoint}`

global.config = Config

// Forcing value as number, if not MNID encoder/decoder may fail
// Config.networkId = Config.ethereum[Config.networkId].network_id
export default Config
