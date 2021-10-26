import './styles/index.css'
import '@fontsource/dm-sans/index.css'
import 'react-tabs/style/react-tabs.css'
import './bootstrap'

import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { KashiProvider } from 'kashi'
import React, { StrictMode, useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { Text, Link, Image } from 'rebass'

import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import Blocklist from './components/Blocklist'
import { NetworkContextName } from './constants'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider from './theme'
import getLibrary from './utils/getLibrary'
import LanguageProvider from 'language'
import { createGlobalStyle } from 'styled-components'
import { Web3ContextProvider } from './hooks/useWeb3'
import Modal from './components/Modal'
import LogoImg from './assets/svg/logo_custom.svg'
import { ButtonAction } from './components/gd/Button'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false
}

const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
} else {
}

function Updaters() {
    return (
        <>
            <ListsUpdater />
            <UserUpdater />
            <ApplicationUpdater />
            <MulticallUpdater />
        </>
    )
}

const Input = styled.input<{ error?: boolean }>`
    border-radius: 5px;
    width: 100%;
`
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 10%;
    justify-content: center;
    align-items: center;
`

function CustomApp() {
    const [auth, setAuth] = useState(false)
    const PASSWORD = 'gdbetatest'
    const PASSWORD_HASH = '$2a$10$V9DPoPvZtRpg9t23wzl5c.jYYyG5VJdJx/pvBJy61WmN/01rkSfSm'

    useEffect(() => {
        if (localStorage.getItem('pass') === PASSWORD_HASH) return setAuth(true)

        const passMatch = window.location.search.match(/pass=(.+?)($|&)/)
        if (passMatch && passMatch[1]) {
            if (passMatch[1] === PASSWORD) {
                localStorage.setItem('pass', PASSWORD_HASH)
                setAuth(true)
            }
        }
    }, [])

    const [value, setValue] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value)
    }

    const handleSubmit = () => {
        if (value) {
            if (value === PASSWORD) {
                localStorage.setItem('pass', PASSWORD_HASH)
                setAuth(true)
            } else {
                alert('Incorrect password')
            }
        }
    }

    return (
        <>
            {auth ? (
                <App />
            ) : (
                <Modal isOpen={true} onDismiss={() => null}>
                    <Wrapper>
                        <Image src={LogoImg} alt="logo" width="100px" />
                        <Text>
                            Enter password to continue to <b>GoodDollar</b>
                        </Text>
                        <Input
                            type="password"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            placeholder="Password"
                            onChange={handleChange}
                            value={value}
                            onKeyDown={e => {
                                e.key === 'Enter' && handleSubmit()
                            }}
                        />
                        <ButtonAction onClick={handleSubmit} size="sm" width="50%">
                            Login
                        </ButtonAction>
                        <Text fontSize={14}>
                            Don&apos;t have password? Subscribe{' '}
                            <Link
                                href="https://www.gooddollar.org/#mauticform_wrapper_phase0newslettersubscription"
                                color="blue"
                            >
                                here
                            </Link>{' '}
                            for updates on the official release
                        </Text>
                    </Wrapper>
                </Modal>
            )}
        </>
    )
}

const GlobalStyle = createGlobalStyle`
  body {
      color: ${({ theme }) => theme.color.text1};
  }

  ::-webkit-scrollbar {
    background-color: ${({ theme }) => theme.color.main};
    width: 16px;
  }
  ::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.color.main};
  }
  ::-webkit-scrollbar-thumb {
    background-color: #babac0;
    border-radius: 16px;
    border: 4px solid ${({ theme }) => theme.color.main};
  }
  ::-webkit-scrollbar-button {
    display:none;
  }
`

ReactDOM.render(
    <StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ProviderNetwork getLibrary={getLibrary}>
                <Web3ContextProvider>
                    <Provider store={store}>
                        <LanguageProvider>
                            <Blocklist>
                                <Updaters />
                                <ThemeProvider>
                                    <GlobalStyle />
                                    <KashiProvider>
                                        <Router>
                                            <CustomApp />
                                        </Router>
                                    </KashiProvider>
                                </ThemeProvider>
                            </Blocklist>
                        </LanguageProvider>
                    </Provider>
                </Web3ContextProvider>
            </Web3ProviderNetwork>
        </Web3ReactProvider>
    </StrictMode>,
    document.getElementById('root')
)
