import { once } from 'lodash'
import { version as contractsVersion } from '../../node_modules/@gooddollar/goodcontracts/package.json'
import { version } from '../../package.json'
import { isWeb } from '../lib/utils/platform'
import { env as devenv, fixNL } from '../lib/utils/env'

import env from './env'

// E2E checker utility import
//import { isE2ERunning } from '../lib/utils/platform'
const { search: qs = '', origin } = isWeb ? window.location : {}

const forceLogLevel = qs.match(/level=(.*?)($|&)/)
const forcePeer = qs.match(/gun=(.*?)($|&)/)

const appEnv = devenv(env.REACT_APP_ENV)
const phase = env.REACT_APP_RELEASE_PHASE || 1

const isPhaseZero = 0 === phase
const isPhaseOne = 1 === phase
const isPhaseTwo = 2 === phase

const alchemyKey = env.REACT_APP_ALCHEMY_KEY
let publicUrl = env.REACT_APP_PUBLIC_URL || origin
const isEToro = env.REACT_APP_ETORO === 'true' || env.REACT_APP_NETWORK === 'etoro'

if (!publicUrl) {
  publicUrl = (() => {
    switch (appEnv) {
      case 'development':
        return 'https://gooddev.netlify.app'
      case 'staging':
        return 'https://goodqa.netlify.app'
      case 'production':
        return 'https://wallet.gooddollar.org'
      default:
        return
    }
  })()
}

const Config = {
  env: appEnv,
  version: appEnv === 'test' ? '1.0' : version, //hard code for tests snapshots
  contractsVersion,
  isEToro,
  phase,
  isPhaseZero,
  isPhaseOne,
  isPhaseTwo,
  newVersionUrl: env.REACT_APP_NEW_VERSION_URL || 'https://whatsnew.gooddollar.org',
  logLevel: (forceLogLevel && forceLogLevel[1]) || env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: env.REACT_APP_SERVER_URL || 'http://localhost:3003',
  gunPublicUrl: env.REACT_APP_GUN_PUBLIC_URL || 'http://localhost:3003/gun',
  nftStorageKey: env.REACT_APP_NFT_STORAGE_KEY,
  nftPeers: (
    env.REACT_APP_NFT_PEERS ||
    'https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link'
  ).split(','),
  nftLazyUpload: env.REACT_APP_NFT_LAZY_UPLOAD === 'true',
  learnMoreEconomyUrl: env.REACT_APP_ECONOMY_URL || 'https://www.gooddollar.org/economic-model/',
  publicUrl,
  dashboardUrl: env.REACT_APP_DASHBOARD_URL || 'https://dashboard.gooddollar.org',
  infuraKey: env.REACT_APP_INFURA_KEY,
  network: env.REACT_APP_NETWORK || 'fuse',
  networkMainnet: env.REACT_APP_NETWORK_MAINNET || 'fuse-mainnet',
  interestCollectedInterval: env.REACT_APP_INTEREST_BLOCKS_INTERVAL || 5760 * 7, // default is 1Week
  marketUrl: env.REACT_APP_MARKET_URL || 'https://gooddollarmarketplace.sharetribe.com/en',
  torusEnabled: env.REACT_APP_USE_TORUS === 'true',
  torusNetwork: env.REACT_APP_TORUS_NETWORK || 'testnet',
  torusProxyContract: env.REACT_APP_TORUS_PROXY_CONTRACT || '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183',
  enableSelfCustody: env.REACT_APP_ENABLE_SELF_CUSTODY === 'true',
  googleClientId: env.REACT_APP_GOOGLE_CLIENT_ID,
  facebookAppId: env.REACT_APP_FACEBOOK_APP_ID,
  auth0ClientId: env.REACT_APP_AUTH0_CLIENT_ID,
  auth0SMSClientId: env.REACT_APP_AUTH0_SMS_CLIENT_ID,
  auth0Domain: env.REACT_APP_AUTH0_DOMAIN || 'https://gooddollar.eu.auth0.com',
  enableInvites: env.REACT_APP_ENABLE_INVITES !== 'false' || isEToro, // true by default
  invitesUrl: env.REACT_APP_INVITES_URL || publicUrl,
  showRewards: env.REACT_APP_DASHBOARD_SHOW_REWARDS === 'true',
  faceTecEncryptionKey: fixNL(env.REACT_APP_ZOOM_ENCRYPTION_KEY),
  faceTecLicenseKey: env.REACT_APP_ZOOM_LICENSE_KEY,
  faceTecProductionMode: env.REACT_APP_ZOOM_PRODUCTION_MODE === 'true',
  faceVerificationRequestTimeout: env.REACT_APP_ZOOM_REQUEST_TIMEOUT || 60000,
  faceVerificationMaxAttemptsAllowed: Number(env.REACT_APP_FACE_VERIFICATION_ATTEMPTS || 3),
  faceVerificationPrivacyUrl:
    env.REACT_APP_FACE_VERIFICATION_PRIVACY_URL ||
    'https://medium.com/gooddollar/gooddollar-identity-pillar-balancing-identity-and-privacy-part-i-face-matching-d6864bcebf54',
  amplitudeKey: env.REACT_APP_AMPLITUDE_API_KEY,
  httpWeb3provider: env.REACT_APP_WEB3_RPC,
  web3TransportProvider: env.REACT_APP_WEB3_TRANSPORT_PROVIDER || 'HttpProvider',
  recaptcha: '6LeOaJIUAAAAAKB3DlmijMPfX2CBYsve3T2MwlTd',
  skipEmailVerification: env.REACT_APP_SKIP_EMAIL_VERIFICATION === 'true',
  skipMobileVerification: env.REACT_APP_SKIP_MOBILE_VERIFICATION === 'true',
  withMockedFeeds: env.REACT_APP_WITH_MOCKED_FEEDS === 'true',
  safariMobileKeyboardGuidedSize: env.REACT_APP_SAFARI_MOBILE_KEYBOARD_GUIDED_SIZE === 'true',
  receiveUrl: env.REACT_APP_RECEIVE_URL || `${publicUrl}`,
  enableShortUrl: env.REACT_APP_ENABLE_SHORTURL === 'true',
  sendUrl: env.REACT_APP_SEND_URL || `${publicUrl}`,
  nextTimeClaim: env.REACT_APP_NEXT_TIME_CLAIM || 86400,
  displayStartClaimingCardTime: env.REACT_APP_DISPLAY_START_CLAIMING_CARD_TIME || 1 * 24 * 60 * 60 * 1000, // 1 days
  backgroundReqsInterval: env.REACT_APP_BACKGROUND_REQS_INTERVAL || 10, // minutes
  sentryDSN: env.REACT_APP_SENTRY_DSN,
  delayMessageNetworkDisconnection: env.REACT_APP_DELAY_MSG_NETWORK_DISCONNECTION || 5000,
  showSplashDesktop: env.REACT_APP_SPLASH_DESKTOP === 'true',
  showAddToHomeDesktop: env.REACT_APP_ADDTOHOME_DESKTOP === 'true',
  flagsUrl: env.REACT_APP_FLAGS_URL || 'https://lipis.github.io/flag-icon-css/flags/4x3/',
  claimQueue: env.REACT_APP_CLAIM_QUEUE_ENABLED === 'true',
  mauticUrl: env.REACT_APP_MAUTIC_URL || 'https://go.gooddollar.org',
  mauticAddContractFormID: env.REACT_APP_MAUTIC_ADDCONTRACT_FORMID || '15',
  apiTimeout: env.REACT_APP_API_REQUEST_TIMEOUT || 30000,
  torusFacebook: env.REACT_APP_TORUS_FACEBOOK || 'facebook-gooddollar',
  torusGoogle: env.REACT_APP_TORUS_GOOGLE || 'google-gooddollar',
  torusGoogleAuth0: env.REACT_APP_TORUS_GOOGLEAUTH0 || 'google-auth0-gooddollar',
  torusAuth0SMS: env.REACT_APP_TORUS_AUTH0SMS || 'gooddollar-auth0-sms-passwordless',
  torusEmailEnabled: env.REACT_APP_TORUS_AUTH0EMAIL_ENABLED === 'true',
  torusUxMode: isWeb ? env.REACT_APP_TORUS_UXMODE || 'redirect' : 'popup',
  abTestPercentage: env.REACT_APP_AB_TEST_PERCENTAGE || 0.5,
  smsRateLimit: env.REACT_APP_SMS_RATE_LIMIT || 60 * 1000, // rate limit for sms code verification resend
  alchemyKey,
  textileKey: env.REACT_APP_TEXTILE_KEY,
  textileSecret: env.REACT_APP_TEXTILE_SECRET,
  ethereum: {
    '1': {
      network_id: 1,

      // httpWeb3provider: `https://kovan.infura.io/v3/`,
      httpWeb3provider: `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,

      // websocketWeb3Provider: 'wss://kovan.infura.io/ws',
      websocketWeb3Provider: `wss://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    },
    '42': {
      network_id: 42,

      // httpWeb3provider: `https://kovan.infura.io/v3/`,
      httpWeb3provider: `https://eth-kovan.alchemyapi.io/v2/${alchemyKey}`,

      // websocketWeb3Provider: 'wss://kovan.infura.io/ws',
      websocketWeb3Provider: `wss://eth-kovan.alchemyapi.io/v2/${alchemyKey}`,
    },
    '3': {
      network_id: 3,
      httpWeb3provider: `https://eth-ropsten.alchemyapi.io/v2/${alchemyKey}`,

      // httpWeb3provider: 'https://ropsten.infura.io/v3/',
      websocketWeb3Provider: `wss://eth-ropsten.alchemyapi.io/v2/${alchemyKey}`,

      // websocketWeb3Provider: 'wss://ropsten.infura.io/ws',
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
  forcePeer: forcePeer && forcePeer[1],
  peersProb: (env.REACT_APP_GUN_PEERS_PROB || '1,0.5').split(',').map(Number),
  isPatch: (version.match(/\d+\.\d+\.(\d+)/) || [])[1] !== '0',
}

//get and override settings from server
export const serverSettings = once(() => {
  return fetch(Config.serverUrl + '/auth/settings', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ env: Config.env }),
  })
    .then(r => r.json())
    .catch(e => {
      return { fromServer: 'error' }
    })
    .then(settings => Object.assign(Config, settings))
})

// TODO: wrap all stubs / "backdoors" made for automated testing
// if (isE2ERunning) {
global.config = Config

//}

// Forcing value as number, if not MNID encoder/decoder may fail
// Config.networkId = Config.ethereum[Config.networkId].network_id
export default Config
