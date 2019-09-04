const Config = {
  env: process.env.REACT_APP_ENV || 'development',
  version: process.env.VERSION || 'v0',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'debug',
  serverUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost:3003',
  gunPublicUrl: process.env.REACT_APP_GUN_PUBLIC_URL || 'http://localhost:3003/gun',
  publicUrl: process.env.REACT_APP_PUBLIC_URL || (window && window.location && window.location.origin),
  infuraKey: process.env.REACT_APP_INFURA_KEY,
  network: process.env.REACT_APP_NETWORK || 'fuse',
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
      websocketWeb3Provider: 'wss://explorer-node.fuse.io/ws',
    },
    '122': {
      network_id: 122,
      httpWeb3provider: 'https://rpc.fusenet.io/',
      websocketWeb3Provider: 'wss://explorer-node.fusenet.io/ws',
    },
    '4447': {
      network_id: 4447,
      httpWeb3provider: 'http://localhost:9545/',
      websocketWeb3Provider: 'ws://localhost:9545/ws',
    },
  },
}

// Forcing value as number, if not MNID encoder/decoder may fail
// Config.networkId = Config.ethereum[Config.networkId].network_id
export default Config
