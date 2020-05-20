import { version as contractsVersion } from '../../node_modules/@gooddollar/goodcontracts/package.json'
import { env as devenv } from '../lib/utils/env'
import env from './env'
const publicUrl = env.REACT_APP_PUBLIC_URL || (window && window.location && window.location.origin)
const isEToro = env.REACT_APP_ETORO === 'true' || env.REACT_APP_NETWORK === 'etoro'

// E2E checker utility import
//import { isE2ERunning } from '../lib/utils/platform'

const forceLogLevel = window && window.location && window.location.search.match(/level=(.*?)($|&)/)

const Config = {
  env: devenv,
  version: process.env.VERSION || 'v0',
  contractsVersion,
  isEToro,
  isPhaseZero: 'true' === env.REACT_APP_ENV_PHASE_ZERO,
  newVersionUrl: env.REACT_APP_NEW_VERSION_URL || 'https://whatsnew.gooddollar.org',
  logLevel: (forceLogLevel && forceLogLevel[1]) || env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: env.REACT_APP_SERVER_URL || 'http://localhost:3003',
  gunPublicUrl: env.REACT_APP_GUN_PUBLIC_URL || 'http://localhost:3003/gun',
  web3SiteUrl: env.REACT_APP_WEB3_SITE_URL || 'https://w3.gooddollar.org',
  learnMoreEconomyUrl: env.REACT_APP_ECONOMY_URL || 'https://www.gooddollar.org/economic-model/',
  publicUrl,
  dashboardUrl: process.env.REACT_APP_DASHBOARD_URL || 'https://dashboard.gooddollar.org',
  infuraKey: process.env.REACT_APP_INFURA_KEY,
  network: process.env.REACT_APP_NETWORK || 'fuse',
  market: process.env.REACT_APP_MARKET === 'true' || isEToro,
  marketUrl: process.env.REACT_APP_MARKET_URL || 'https://etoro.paperclip.co',
  torusEnabled: process.env.REACT_APP_USE_TORUS === 'true',
  enableSelfCustody: process.env.REACT_APP_ENABLE_SELF_CUSTODY === 'true',
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID,
  enableInvites: process.env.REACT_APP_ENABLE_INVITES !== 'false' || isEToro, // true by default
  showInvite: process.env.REACT_APP_DASHBOARD_SHOW_INVITE === 'true',
  showRewards: process.env.REACT_APP_DASHBOARD_SHOW_REWARDS === 'true',
  zoomLicenseKey: process.env.REACT_APP_ZOOM_LICENSE_KEY,
  zoomServerURL: process.env.REACT_APP_ZOOM_SERVER_BASEURL || 'https://api.zoomauth.com/api/v2/biometrics',
  amplitudeKey: process.env.REACT_APP_AMPLITUDE_API_KEY,
  rollbarKey: process.env.REACT_APP_ROLLBAR_API_KEY,
  httpWeb3provider: process.env.REACT_APP_WEB3_RPC,
  web3TransportProvider: process.env.REACT_APP_WEB3_TRANSPORT_PROVIDER || 'WebSocketProvider',
  recaptcha: '6LeOaJIUAAAAAKB3DlmijMPfX2CBYsve3T2MwlTd',
  skipEmailVerification: env.REACT_APP_SKIP_EMAIL_VERIFICATION === 'true',
  skipMobileVerification: env.REACT_APP_SKIP_MOBILE_VERIFICATION === 'true',
  throwSaveProfileErrors:
    !env.REACT_APP_THROW_SAVE_PROFILE_ERRORS || env.REACT_APP_THROW_SAVE_PROFILE_ERRORS === 'true',
  withMockedFeeds: env.REACT_APP_WITH_MOCKED_FEEDS === 'true',
  safariMobileKeyboardGuidedSize: env.REACT_APP_SAFARI_MOBILE_KEYBOARD_GUIDED_SIZE === 'true',
  receiveUrl: env.REACT_APP_RECEIVE_URL || `${publicUrl}`,
  enableShortUrl: env.REACT_APP_ENABLE_SHORTURL === 'true',
  sendUrl: env.REACT_APP_SEND_URL || `${publicUrl}`,
  nextTimeClaim: env.REACT_APP_NEXT_TIME_CLAIM || 86400,
  displayStartClaimingCardTime: env.REACT_APP_DISPLAY_START_CLAIMING_CARD_TIME || 1 * 24 * 60 * 60 * 1000, // 1 days
  bugsnagKey: env.REACT_APP_BUGSNAG_API_KEY,
  backgroundReqsInterval: env.REACT_APP_BACKGROUND_REQS_INTERVAL || 10, // minutes
  sentryDSN: env.REACT_APP_SENTRY_DSN,
  hanukaStartDate: env.REACT_APP_HANUKA_START_DATE, // date
  hanukaEndDate: env.REACT_APP_HANUKA_END_DATE, // date
  delayMessageNetworkDisconnection: env.REACT_APP_DELAY_MSG_NETWORK_DISCONNECTION || 3000,
  showSplashDesktop: env.REACT_APP_SPLASH_DESKTOP === 'true',
  showAddToHomeDesktop: env.REACT_APP_ADDTOHOME_DESKTOP === 'true',
  flagsUrl: env.REACT_APP_FLAGS_URL || 'https://lipis.github.io/flag-icon-css/flags/4x3/',
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

// TODO: wrap all stubs / "backdoors" made for automated testing
// if (isE2ERunning) {
  global.config = Config

//}

// Forcing value as number, if not MNID encoder/decoder may fail
// Config.networkId = Config.ethereum[Config.networkId].network_id
export default Config
