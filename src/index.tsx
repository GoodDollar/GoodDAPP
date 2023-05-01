import './styles/index.css'
import '@fontsource/dm-sans/index.css'
import 'react-tabs/style/react-tabs.css'
import './bootstrap'

import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import { AnalyticsProvider } from '@gooddollar/web3sdk-v2/dist/sdk/analytics'
import Blocklist from './components/Blocklist'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import MulticallUpdater from './state/multicall/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider from './theme'
import LanguageProvider from 'language'
import { createGlobalStyle } from 'styled-components'
import { Web3ContextProvider } from './hooks/useWeb3'
import { theme, NativeBaseProvider } from '@gooddollar/good-design'
import { analyticsConfig, appInfo } from 'hooks/useSendAnalyticsData'
import { OnboardProvider } from '@gooddollar/web3sdk-v2'
import { connectOptions, torus } from 'connectors'
import { HttpsProvider } from 'utils/HttpsProvider'
import { registerServiceWorker } from './serviceWorker'

if (window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false
}

const GlobalStyle = createGlobalStyle`
  body {
      color: ${({ theme }) => theme.color.text1};
  }


  :root {
    --onboard-wallet-columns: 2;
    --foreground-color: #eff1fc;
    --onboard-wallet-button-background-hover: #eff1fc;
    --onboard-wallet-button-border-color: #E9ECFF;
    --onboard-wallet-app-icon-border-color: #E9ECFF;
    --onboard-close-button-background: none;
    --onboard-close-button-color: black;
    --onboard-font-family-normal: ${({ theme }) => theme.font.primary};
    --onboard-font-family-light: ${({ theme }) => theme.font.secondary};


  }
  onboard-v2::part(sidebar-heading-img) {
    max-width: 100%;
    height: fit-content;
  }
  onboard-v2::part(main-modal) {
    @media screen and (max-width: 420px) {
      width: 90%;
    }
  }
  onboard-v2::part(mobile-icon-container) {
    width: fit-content;
  }

  onboard-v2::part(mobile-icon-img) {
    width: 150px;
    height: fit-content;
  }
`

const enableHttpsRedirect = String(process.env.REACT_APP_ENABLE_HTTPS_REDIRECT) === '1'
const enableServiceWorker =
    window.location.hostname !== 'localhost' && String(process.env.REACT_APP_ENABLE_SERVICE_WORKER) === '1'

ReactDOM.render(
    <StrictMode>
        <HttpsProvider enabled={enableHttpsRedirect}>
            <OnboardProvider options={connectOptions} wallets={{ custom: [torus] }}>
                <Web3ContextProvider>
                    <Provider store={store}>
                        <LanguageProvider>
                            <AnalyticsProvider config={analyticsConfig} appProps={appInfo}>
                                <Blocklist>
                                    <UserUpdater />
                                    <ApplicationUpdater />
                                    <MulticallUpdater />
                                    <ThemeProvider>
                                        <NativeBaseProvider theme={theme}>
                                            <GlobalStyle />
                                            <Router>
                                                <App />
                                            </Router>
                                        </NativeBaseProvider>
                                    </ThemeProvider>
                                </Blocklist>
                            </AnalyticsProvider>
                        </LanguageProvider>
                    </Provider>
                </Web3ContextProvider>
            </OnboardProvider>
        </HttpsProvider>
    </StrictMode>,
    document.getElementById('root')
)

console.log('service worker options', {
    REACT_APP_ENABLE_SERVICE_WORKER: process.env.REACT_APP_ENABLE_SERVICE_WORKER,
    enableServiceWorker,
})

if (enableServiceWorker) {
    console.log('registering service worker...')

    registerServiceWorker()
}
