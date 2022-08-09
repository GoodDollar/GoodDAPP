import { get, noop } from 'lodash'
import moment from 'moment'

import contractsAddress from '@gooddollar/goodprotocol/releases/deployment.json'
import { version as contractsVersion } from '@gooddollar/goodcontracts/package.json'
import { version } from '../../package.json'

import { isWeb } from '../lib/utils/platform'
import { appEnv, fixNL, appUrl as publicUrl } from '../lib/utils/env'
import mustache from '../lib/utils/mustache'

import env from './env'

const { search: qs = '' } = isWeb ? window.location : {}
const webStorage = isWeb ? window.localStorage : { getItem: noop }

const forceLogLevel = get(qs.match(/level=(.*?)($|&)/), 1, webStorage.getItem('GD_LogLevel'))
const forcePeer = qs.match(/gun=(.*?)($|&)/)

const phase = env.REACT_APP_RELEASE_PHASE || 1

const isPhaseZero = 0 === phase
const isPhaseOne = 1 === phase
const isPhaseTwo = 2 === phase

const isEToro = env.REACT_APP_ETORO === 'true' || env.REACT_APP_NETWORK === 'etoro'
const ipfsGateways = env.REACT_APP_IPFS_GATEWAYS || 'https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link'

const alchemyKey = env.REACT_APP_ALCHEMY_KEY
const network = env.REACT_APP_NETWORK || 'fuse'
const { networkId } = contractsAddress[network]

export const fuseNetwork = {
  httpWeb3provider: env.REACT_APP_WEB3_RPC || 'https://rpc.fuse.io/',
  websocketWeb3Provider: 'wss://rpc.fuse.io/ws',
  explorer: 'https://explorer.fuse.io',
  explorerName: 'fusescan',
  network_id: 122,
}

const ethereum = {
  '1': {
    network_id: 1,
    httpWeb3provider: `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://etherscan.io',
    explorerName: 'etherscan',
  },
  '42': {
    network_id: 42,
    httpWeb3provider: `https://eth-kovan.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-kovan.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://kovan.etherscan.io',
    explorerName: 'etherscan',
  },
  '3': {
    network_id: 3,
    httpWeb3provider: `https://eth-ropsten.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-ropsten.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://ropsten.etherscan.io',
    explorerName: 'etherscan',
  },
  '121': {
    ...fuseNetwork,
    network_id: 121,
  },
  '122': {
    ...fuseNetwork,
    network_id: 122,
  },
  '4447': {
    ...fuseNetwork,
    network_id: 4447,
    httpWeb3provider: 'http://localhost:8545/',
    websocketWeb3Provider: 'ws://localhost:8545/ws',
  },
}

const Config = {
  env: appEnv,
  version: appEnv === 'test' ? '1.0' : version, //hard code for tests snapshots
  contractsVersion,
  network,
  networkId,
  ethereum,
  isEToro,
  phase,
  isPhaseZero,
  isPhaseOne,
  isPhaseTwo,
  publicUrl,
  alchemyKey,
  newVersionUrl: env.REACT_APP_NEW_VERSION_URL || 'https://whatsnew.gooddollar.org',
  logLevel: forceLogLevel || env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: env.REACT_APP_SERVER_URL || 'http://localhost:3003',
  gunPublicUrl: env.REACT_APP_GUN_PUBLIC_URL || 'http://localhost:3003/gun',
  ipfsGateways: ipfsGateways.split(',').map(gatewayTmpl => mustache(gatewayTmpl)),
  ipfsUploadGateway: env.REACT_APP_IPFS_UPLOADGATEWAY || 'https://ipfsgateway.goodworker.workers.dev',
  ipfsLazyUpload: env.REACT_APP_IPFS_LAZY_UPLOAD === 'true',
  pinataApiKey: env.REACT_APP_PINATA_API_KEY,
  pinataSecret: env.REACT_APP_PINATA_SECRET,
  pinataBaseUrl: env.REACT_APP_PINATA_API_URL || 'https://api.pinata.cloud',
  learnMoreEconomyUrl: env.REACT_APP_ECONOMY_URL || 'https://www.gooddollar.org/economic-model/',
  dashboardUrl: env.REACT_APP_DASHBOARD_URL || 'https://dashboard.gooddollar.org',
  infuraKey: env.REACT_APP_INFURA_KEY,
  interestCollectedInterval: env.REACT_APP_INTEREST_BLOCKS_INTERVAL || 5760 * 8, // default is 1Week, add 1 day because its not exact
  goodDollarPriceInfoUrl: env.REACT_APP_PRICE_INFO_URL || 'https://datastudio.google.com/u/0/reporting/f1ce8f56-058c-4e31-bfd4-1a741482642a/page/p_97jwocmrmc',
  marketUrl: env.REACT_APP_MARKET_URL || 'https://gooddollarmarketplace.sharetribe.com/en',
  torusEnabled: env.REACT_APP_USE_TORUS === 'true',
  torusNetwork: env.REACT_APP_TORUS_NETWORK || 'testnet',
  torusProxyContract: env.REACT_APP_TORUS_PROXY_CONTRACT || '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183',
  enableSelfCustody: env.REACT_APP_ENABLE_SELF_CUSTODY === 'true',
  disableClaim: env.REACT_APP_DISABLE_CLAIM === 'true',
  googleClientId: env.REACT_APP_GOOGLE_CLIENT_ID,
  facebookAppId: env.REACT_APP_FACEBOOK_APP_ID,
  authSuccessDelay: Number(env.REACT_APP_SUCCESS_DELAY || 2000),
  auth0ClientId: env.REACT_APP_AUTH0_CLIENT_ID,
  auth0SMSClientId: env.REACT_APP_AUTH0_SMS_CLIENT_ID,
  auth0Domain: env.REACT_APP_AUTH0_DOMAIN || 'https://gooddollar.eu.auth0.com',
  enableInvites: env.REACT_APP_ENABLE_INVITES !== 'false' || isEToro, // true by default
  invitesUrl: env.REACT_APP_INVITES_URL || publicUrl,
  showRewards: env.REACT_APP_DASHBOARD_SHOW_REWARDS === 'true',
  suggestMobileApp: env.REACT_APP_SUGGEST_MOBILE_APP !== 'false',
  suggestMobileAppUpdate: env.REACT_APP_SUGGEST_MOBILE_APP_UPDATE === 'true',
  suggestCodePushUpdate: env.REACT_APP_SUGGEST_CODE_PUSH_UPDATE !== 'false',
  codePushDeploymentKey: env.REACT_APP_CODE_PUSH_KEY,
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
  feedItemTtl: moment.duration(env.REACT_APP_FEEDITEM_TTL || '24:00:00').as('milliseconds'), // default for 1 day
  safariMobileKeyboardGuidedSize: env.REACT_APP_SAFARI_MOBILE_KEYBOARD_GUIDED_SIZE === 'true',
  receiveUrl: env.REACT_APP_RECEIVE_URL || `${publicUrl}`,
  enableShortUrl: env.REACT_APP_ENABLE_SHORTURL === 'true',
  sendUrl: env.REACT_APP_SEND_URL || `${publicUrl}`,
  nextTimeClaim: env.REACT_APP_NEXT_TIME_CLAIM || 86400,
  displayStartClaimingCardTime: env.REACT_APP_DISPLAY_START_CLAIMING_CARD_TIME || 1 * 24 * 60 * 60 * 1000, // 1 days
  backgroundReqsInterval: env.REACT_APP_BACKGROUND_REQS_INTERVAL || 10, // minutes
  sentryDSN: env.REACT_APP_SENTRY_DSN,
  delayMessageNetworkDisconnection: env.REACT_APP_DELAY_MSG_NETWORK_DISCONNECTION || 5000,
  poweredByUrl: env.REACT_APP_POWERED_BY_URL || 'https://vercel.com/?utm_source=gooddollar&utm_campaign=oss',
  showAddToHomeDesktop: env.REACT_APP_ADDTOHOME_DESKTOP === 'true',
  claimQueue: env.REACT_APP_CLAIM_QUEUE_ENABLED === 'true',
  mauticUrl: env.REACT_APP_MAUTIC_URL || 'https://go.gooddollar.org',
  mauticAddContractFormID: env.REACT_APP_MAUTIC_ADDCONTRACT_FORMID || '15',
  apiTimeout: env.REACT_APP_API_REQUEST_TIMEOUT || 30000,
  blockchainTimeout: parseInt(env.REACT_APP_BLOCKCHAIN_REQUEST_TIMEOUT || 1000),
  torusFacebook: env.REACT_APP_TORUS_FACEBOOK || 'facebook-gooddollar',
  torusGoogle: env.REACT_APP_TORUS_GOOGLE || 'google-gooddollar',
  torusGoogleAuth0: env.REACT_APP_TORUS_GOOGLEAUTH0 || 'google-auth0-gooddollar',
  torusAuth0SMS: env.REACT_APP_TORUS_AUTH0SMS || 'gooddollar-auth0-sms-passwordless',
  torusEmailEnabled: env.REACT_APP_TORUS_AUTH0EMAIL_ENABLED === 'true',
  torusUxMode: isWeb ? env.REACT_APP_TORUS_UXMODE || 'redirect' : 'popup',
  abTestPercentage: env.REACT_APP_AB_TEST_PERCENTAGE || 0.5,
  smsRateLimit: env.REACT_APP_SMS_RATE_LIMIT || 60 * 1000, // rate limit for sms code verification resend
  recaptchaSiteKey: env.REACT_APP_RECAPTCHA_SITE_KEY,
  textileKey: env.REACT_APP_TEXTILE_KEY,
  enableRefund: env.REACT_APP_ENABLE_REFUND === 'true',
  refundInfoLink: env.REACT_APP_REFUND_INFO_LINK || 'https://www.gooddollar.org/restoring-a-fair-gooddollar-ubi-pool/?utm_source=wallet',
  textileSecret: env.REACT_APP_TEXTILE_SECRET,
  web3Polling: env.REACT_APP_WEB3_POLLING || 30 * 1000, //poll every 30 seconds by default
  realmAppID: env.REACT_APP_REALM_APP_ID || 'wallet_dev-dhiht',
  nodeEnv: env.NODE_ENV,
  forcePeer: forcePeer && forcePeer[1],
  peersProb: (env.REACT_APP_GUN_PEERS_PROB || '1,0.5').split(',').map(Number),
  isPatch: (version.match(/\d+\.\d+\.(\d+)/) || [])[1] !== '0',
  storeAppIconAndroid: env.STORE_APP_ICON_ANDROID || "/store-app-icon-android.jpg",
  storeAppUrlAndroid: env.STORE_APP_URL_ANDROID || "https://play.google.com/store/apps/details?id=org.gooddollar",
  minimalIOSVersion: env.MINIMAL_IOS_VERSION || 12,
  debugUserAgent: env.REACT_APP_DEBUG_USER_AGENT || false,
  showGoodDollarPrice: env.REACT_APP_SHOW_GOODDOLLAR_PRICE !== false,
  ceramicNodeURL: env.REACT_APP_CERAMIC_NODE_URL || 'https://ceramic-clay.3boxlabs.com',
  ceramicIndex: env.REACT_APP_CERAMIC_INDEX,
  ceramicLiveIndex: env.REACT_APP_CERAMIC_LIVE_INDEX,
  ceramicBatchSize: (env.REACT_APP_CERAMIC_BATCH_SIZE || 5),
  ceramicPollInterval: parseInt(env.REACT_APP_CERAMIC_POLL_INTERVAL || 3600),
  graphQlUrl: env.REACT_APP_GRAPHQL_URL || 'https://api.thegraph.com/subgraphs/name/gooddollar',
  chainIdUrl: env.REACT_APP_CHAINID_URL || 'https://chainid.network',
  networkExplorerUrl: ethereum[networkId].explorer,
  isFVFlow: process.env.REACT_APP_BUILD_TARGET === 'FV',
  enableWebNotifications: process.env.REACT_APP_ENABLE_WEB_NOTIFICATIONS === 'true'
}

global.config = Config

// Forcing value as number, if not MNID encoder/decoder may fail
// Config.networkId = Config.ethereum[Config.networkId].network_id
export default Config
