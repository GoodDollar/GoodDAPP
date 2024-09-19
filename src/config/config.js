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

const ipfsGateways = env.REACT_APP_IPFS_GATEWAYS || 'https://{cid}.ipfs.nftstorage.link,https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link'

const alchemyKey = env.REACT_APP_ALCHEMY_KEY
const network = env.REACT_APP_NETWORK || 'development-celo'
const { networkId } = contractsAddress[network]
const fuseRpc = env.REACT_APP_WEB3_RPC || "https://rpc.fuse.io"
const celoRpc = env.REACT_APP_WEB3_RPC_CELO || "https://forno.celo.org"

export const fuseNetwork = {
  httpWeb3provider: fuseRpc,
  websocketWeb3Provider: 'wss://rpc.fuse.io/ws',
  explorer: 'https://explorer.fuse.io',
  explorerAPI: 'https://explorer.fuse.io',
  defaultPublicRpc: 'https://rpc.fuse.io/',
  explorerName: 'fusescan',
  network_id: 122,
  gasPrice: 11, // in gwei
  g$Decimals: 2,
}

const ethereum = {
  '1': {
    network_id: 1,
    httpWeb3provider: `https://1rpc.io/eth,https://eth-pokt.nodies.app,https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://etherscan.io',
    explorerAPI: 'https://api.etherscan.io',
    explorerName: 'etherscan',
  },
  '3': {
    network_id: 1,
    httpWeb3provider: `https://1rpc.io/eth,https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://etherscan.io',
    explorerAPI: 'https://api.etherscan.io',
    explorerName: 'etherscan',
    gasPrice: 1,
  },
  '5': {
    network_id: 1,
    httpWeb3provider: `https://1rpc.io/eth,https://eth-rpc.gateway.pokt.network,https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://etherscan.io',
    explorerAPI: 'https://api.etherscan.io',
    explorerName: 'etherscan',
  },

  // kovan/ropsten should/could be removed, 
  // but dev contracts in goodprotocol could still request the networks
  '42': {
    network_id: 42,
    httpWeb3provider: `https://eth-kovan.alchemyapi.io/v2/${alchemyKey}`,
    websocketWeb3Provider: `wss://eth-kovan.alchemyapi.io/v2/${alchemyKey}`,
    explorer: 'https://kovan.etherscan.io',
    explorerName: 'etherscan',
  },
  '121': {
    ...fuseNetwork,
    network_id: 121,
  },
  '122': {
    ...fuseNetwork,
    network_id: 122,
    startBlock: 6400000,    
  },
  '4447': {
    ...fuseNetwork,
    network_id: 4447,
    httpWeb3provider: 'http://localhost:8545/',
    websocketWeb3Provider: 'ws://localhost:8545/ws',
  },
  '42220': {
    httpWeb3provider: celoRpc,
    explorer: 'https://celoscan.io',
    explorerAPI: 'https://api.celoscan.io,https://explorer.celo.org/mainnet',
    explorerName: 'celoscan',
    network_id: 42220,
    startBlock: 18000000,    
    gasPrice: 5,
    g$Decimals: 18,
    defaultPublicRpc: 'https://forno.celo.org/',
  },
}

const notifyOptsTest = {
  notificationSchedule: 'minute', // repeat in each minute
  notificationTime: new Date(Date.now() + 60 * 1000), // 1 minute after app been started
}

const notifyOpts = {
  notificationSchedule: 'day', // repeat daily
  notificationTime: (() => {
    // 12 PM UTC
    const date = new Date()

    date.setUTCHours(12, 0, 0, 0)
    return date
  })(),
}

const torusNetwork = env.REACT_APP_TORUS_NETWORK || 'testnet'
const isDeltaApp = env.REACT_APP_DELTA === 'true'

const Config = {
  env: appEnv,
  version: appEnv === 'test' ? '1.0' : version, //hard code for tests snapshots
  contractsVersion,
  network,
  ethereum,
  publicUrl,
  alchemyKey,
  supportUrl: env.REACT_APP_SUPPORT_URL || 'https://t.me/+jay3UR6_rEwxNjY0',
  newVersionUrl: env.REACT_APP_NEW_VERSION_URL || 'https://whatsnew.gooddollar.org',
  logLevel: forceLogLevel || env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: env.REACT_APP_SERVER_URL || 'http://localhost:3003',
  ipfsGateways: ipfsGateways.split(',').map(gatewayTmpl => mustache(gatewayTmpl)),
  ipfsUploadGateway: env.REACT_APP_IPFS_UPLOADGATEWAY || 'https://ipfsgateway.goodworker.workers.dev',
  dashboardUrl: env.REACT_APP_DASHBOARD_URL || 'https://dashboard.gooddollar.org',
  infuraKey: env.REACT_APP_INFURA_KEY,
  goodSwapUrl: env.REACT_APP_GOODSWAP_URL || 'http://dev.gooddapp.org/#/swap',
  goodDollarPriceInfoUrl: env.REACT_APP_PRICE_INFO_URL || 'https://datastudio.google.com/u/0/reporting/f1ce8f56-058c-4e31-bfd4-1a741482642a/page/p_97jwocmrmc',
  learnUrl: env.REACT_APP_LEARN_URL || 'https://gooddollar.notion.site/GoodDollar-550f7d74c59c4123a7851fea52891811',
  useGdUrl: env.REACT_APP_USE_GD_URL || 'https://gooddollar.notion.site/Use-G-8639553aa7214590a70afec91a7d9e73',
  donateUrl: env.REACT_APP_DONATE_URL || 'https://gooddollar.notion.site/Donate-to-a-G-Cause-e7d31fb67bb8494abb3a7989ebe6f181',
  voteUrl: env.REACT_APP_VOTE_URL || 'https://gooddollar.notion.site/About-GoodDAO-a8568c97caec44968e6b6e96303d73ad',
  torusEnabled: env.REACT_APP_USE_TORUS === 'true',
  torusNetwork,
  enableSelfCustody: env.REACT_APP_ENABLE_SELF_CUSTODY === 'true',
  testClaimNotification: appEnv === 'production' ? false : env.REACT_APP_TEST_CLAIM_NOTIFICATION === 'true',
  disableClaim: env.REACT_APP_DISABLE_CLAIM === 'true',
  googleClientId: env.REACT_APP_GOOGLE_CLIENT_ID,
  facebookAppId: env.REACT_APP_FACEBOOK_APP_ID,
  authSuccessDelay: Number(env.REACT_APP_SUCCESS_DELAY || 2000),
  auth0ClientId: env.REACT_APP_AUTH0_CLIENT_ID,
  auth0SMSClientId: env.REACT_APP_AUTH0_SMS_CLIENT_ID,
  auth0Domain: env.REACT_APP_AUTH0_DOMAIN || 'https://gooddollar.eu.auth0.com',
  enableInvites: env.REACT_APP_ENABLE_INVITES !== 'false', // true by default
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
  httpProviderStrategy: env.REACT_APP_WEB3_RPC_STRATEGY || 'random',
  httpProviderRetries: Number(env.REACT_APP_WEB3_RPC_RETRIES || 1),
  web3TransportProvider: env.REACT_APP_WEB3_TRANSPORT_PROVIDER || 'HttpProvider',
  skipEmailVerification: env.REACT_APP_SKIP_EMAIL_VERIFICATION === 'true',
  skipMobileVerification: env.REACT_APP_SKIP_MOBILE_VERIFICATION === 'true',
  feedItemTtl: moment.duration(env.REACT_APP_FEEDITEM_TTL || '24:00:00').as('milliseconds'), // default for 1 day
  safariMobileKeyboardGuidedSize: env.REACT_APP_SAFARI_MOBILE_KEYBOARD_GUIDED_SIZE === 'true',
  receiveUrl: (env.REACT_APP_RECEIVE_URL || publicUrl) + "/open",
  sendUrl: (env.REACT_APP_SEND_URL || publicUrl) + "/open",
  invitesUrl: (env.REACT_APP_INVITES_URL || publicUrl) + "/open",
  enableShortUrl: env.REACT_APP_ENABLE_SHORTURL === 'true',
  displayStartClaimingCardTime: env.REACT_APP_DISPLAY_START_CLAIMING_CARD_TIME || 1 * 24 * 60 * 60 * 1000, // 1 days
  sentryDSN: env.REACT_APP_SENTRY_DSN,
  sentryReplaySampleRate: Number(env.REACT_APP_SENTRY_REPLAY_SAMPLE_RATE || 1.0),
  sentryReplayEnabled: env.REACT_APP_SENTRY_REPLAY_ENABLED === 'true',
  delayMessageNetworkDisconnection: env.REACT_APP_DELAY_MSG_NETWORK_DISCONNECTION || 5000,
  poweredByUrl: env.REACT_APP_POWERED_BY_URL || 'https://vercel.com/?utm_source=gooddollar&utm_campaign=oss',
  showAddToHomeDesktop: env.REACT_APP_ADDTOHOME_DESKTOP === 'true',
  apiTimeout: env.REACT_APP_API_REQUEST_TIMEOUT || 30000,
  blockchainTimeout: parseInt(env.REACT_APP_BLOCKCHAIN_REQUEST_TIMEOUT || 1000),
  torusFacebook: env.REACT_APP_TORUS_FACEBOOK || 'facebook-gooddollar',
  torusGoogle: env.REACT_APP_TORUS_GOOGLE || 'google-gooddollar',
  torusGoogleAuth0: env.REACT_APP_TORUS_GOOGLEAUTH0 || 'google-auth0-gooddollar',
  torusAuth0SMS: env.REACT_APP_TORUS_AUTH0SMS || 'gooddollar-auth0-sms-passwordless',
  torusUxMode: isWeb ? env.REACT_APP_TORUS_UXMODE || 'redirect' : 'popup',
  torusRedirectUrl: isDeltaApp ? env.REACT_APP_TORUS_REDIRECT_URL || publicUrl : publicUrl, // REACT_APP_TORUS_REDIRECT_URL avalable for Delta ONLY
  torusWeb3AuthClientId: env.REACT_APP_TORUS_WEB3AUTH_CLIENT_ID,
  abTestPercentage: env.REACT_APP_AB_TEST_PERCENTAGE || 0.5,
  smsRateLimit: env.REACT_APP_SMS_RATE_LIMIT || 60 * 1000, // rate limit for sms code verification resend
  recaptchaSiteKey: env.REACT_APP_RECAPTCHA_SITE_KEY,
  hcaptchaSiteKey: env.REACT_APP_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001', //test key
  fpSiteKey: env.REACT_APP_FINGERPRINT_SITE_KEY,
  fpEndpoint: env.REACT_APP_FINGERPRINT_ENDPOINT || 'https://api.fpjs.io',
  enableRefund: env.REACT_APP_ENABLE_REFUND === 'true',
  refundInfoLink: env.REACT_APP_REFUND_INFO_LINK || 'https://www.gooddollar.org/restoring-a-fair-gooddollar-ubi-pool/?utm_source=wallet',
  web3Polling: env.REACT_APP_WEB3_POLLING || 30 * 1000, //poll every 30 seconds by default
  realmAppID: env.REACT_APP_REALM_APP_ID || 'wallet_dev-dhiht',
  nodeEnv: env.NODE_ENV,
  storeAppIconAndroid: env.STORE_APP_ICON_ANDROID || "/store-app-icon-android.jpg",
  storeAppUrlAndroid: env.STORE_APP_URL_ANDROID || "https://play.google.com/store/apps/details?id=org.gooddollar",
  minimalIOSVersion: env.MINIMAL_IOS_VERSION || 12,
  debugUserAgent: env.REACT_APP_DEBUG_USER_AGENT || false,
  showGoodDollarPrice: env.REACT_APP_SHOW_GOODDOLLAR_PRICE !== false,
  ceramicNodeURL: env.REACT_APP_CERAMIC_NODE_URL || 'https://ceramic-clay.3boxlabs.com',
  orbisFeedContext: env.REACT_APP_ORBIS_FEED_CONTEXT || 'kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os',
  ceramicIndex: env.REACT_APP_CERAMIC_INDEX,
  ceramicLiveIndex: env.REACT_APP_CERAMIC_LIVE_INDEX,
  ceramicBatchSize: (env.REACT_APP_CERAMIC_BATCH_SIZE || 5),
  ceramicPollInterval: parseInt(env.REACT_APP_CERAMIC_POLL_INTERVAL || 3600) * 1000,
  ceramicSyncTimeout: env.REACT_APP_CERAMIC_SYNC_TIMEOUT || 5000,
  graphQlUrl: env.REACT_APP_GRAPHQL_URL || 'https://api.thegraph.com/subgraphs/name/gooddollar',
  chainIdUrl: env.REACT_APP_CHAINID_URL || 'https://chainid.network',
  networkId,
  isFVFlow: env.REACT_APP_BUILD_TARGET === 'FV',
  estimateGasPrice: env.REACT_APP_ESTIMATE_GAS_PRICE === 'true',
  defaultGasPrice: parseInt(env.REACT_APP_DEFAULT_GAS_PRICE || 11),
  defaultTxGas: parseInt(env.REACT_APP_DEFAULT_TX_GAS || 1000000),
  verifyCaptchaUrl: env.REACT_APP_VERIFY_CAPTCHA_URL || 'https://verify.goodworker.workers.dev',
  ...(env.REACT_APP_TEST_CLAIM_NOTIFICATION === 'true' ? notifyOptsTest :  notifyOpts),
  isDeltaApp,
  showAllChainsEth: isDeltaApp && env.REACT_APP_FORCE_ALL_CHAINS_ETH === 'true',
  posthogApiKey: env.REACT_APP_POSTHOG_KEY,
  tatumApiUrl: env.REACT_APP_TATUM_API_URL || 'https://api.tatum.io/v3',
  tatumApiKey: env.REACT_APP_TATUM_KEY,
  posthogHost: isWeb ? "https://vercelrp.gooddollar.org/ingest" : "https://app.posthog.com", //reverse proxy using vercel
  fvTypeformUrl: 'https://gooddollar.typeform.com/to/Prgnwkrz',
  gasFeeNotionUrl: 'https://www.notion.so/gooddollar/Why-does-it-say-I-m-Out-of-Gas-d92e5e20b6144dfbb12979e266e72959',
}

global.config = Config

export default Config
