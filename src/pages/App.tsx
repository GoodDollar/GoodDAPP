import React, { Suspense, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { AppBar, Polling, Popups } from '../components'
import Web3ReactManager from '../components/Web3ReactManager'
import Routes from '../routes'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../state'
import { updateUserDarkMode } from '../state/user/actions'
import { parse } from 'qs'
import isEqual from 'lodash/isEqual'
import SideBar from '../components/SideBar'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import TransactionUpdater from '../state/transactions/updater'

export const Beta = styled.div`
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 166%;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.text5};
    text-align: center;

    @media screen and (max-height: 720px) {
        font-size: 12px;
        margin-top: 30px;
    }
`

const Wrapper = styled.div`
    @media ${({ theme }) => theme.media.md} {
        padding-bottom: 75px;
    }
`

const MainBody = styled.div<{$page?: string}>`
  ${({$page}) => $page === "/dashboard" && (`
    width: 80%;
    height: 100%;
    padding: 50px 20px 50px 20px;
  `)}
  background-color: ${({theme}) => theme.color.bgBody};
`

function App(): JSX.Element {
    const bodyRef = useRef<any>(null)

    const { location, replace } = useHistory()

    const { search, pathname } = useLocation()

    const dispatch = useDispatch<AppDispatch>()
    const [preservedSource, setPreservedSource] = useState('')

    useEffect(() => {
        const parsed = parse(location.search, { parseArrays: false, ignoreQueryPrefix: true })

        if (!isEqual(parsed['utm_source'], preservedSource)) {
            setPreservedSource(parsed['utm_source'] as string)
        }

        if (preservedSource && !location.search.includes('utm_source')) {
            replace({
                ...location,
                search: location.search
                    ? location.search + '&utm_source=' + preservedSource
                    : location.search + '?utm_source=' + preservedSource
            })
        }
    }, [preservedSource, location, replace])

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTo(0, 0)
        }
    }, [pathname])

    useEffect(() => {
        if (!search) return
        if (search.length < 2) return

        const parsed = parse(search, {
            parseArrays: false,
            ignoreQueryPrefix: true
        })

        const theme = parsed.theme

        if (typeof theme !== 'string') return

        if (theme.toLowerCase() === 'light') {
            dispatch(updateUserDarkMode({ userDarkMode: false }))
        } else if (theme.toLowerCase() === 'dark') {
            dispatch(updateUserDarkMode({ userDarkMode: true }))
        }
    }, [dispatch, search])

    const { i18n } = useLingui()

    return (
        <Suspense fallback={null}>
            <div className="flex flex-col h-screen overflow-hidden">
                <AppBar />
                <Wrapper className="flex flex-grow overflow-hidden">
                    <SideBar />
                    <MainBody
                        ref={bodyRef}
                        className="flex flex-col items-center justify-between flex-grow h-full overflow-y-auto overflow-x-hidden z-0 pt-4 sm:pt-8 px-4 md:pt-10 pb-4"
                        $page={location.pathname}
                    >
                        <Popups />
                        {/*<Polling />*/}
                        <Web3ReactManager>
                            <div className={`flex flex-col flex-glow w-full items-center justify-start
                             ${location.pathname === '/dashboard' ? "md:auto" : "md:h-screen"} 
                             md:justify-center xl:-mt-8`}>
                                <Routes />
                                <TransactionUpdater />
                            </div>
                        </Web3ReactManager>
                        <Beta className="mt-3 lg:mt-8">{i18n._(t`This project is in beta. Use at your own risk`)}</Beta>
                    </MainBody>
                </Wrapper>
            </div>
        </Suspense>
    )
}

export default App
