import React, { Suspense, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useFaucet } from '@gooddollar/web3sdk-v2'
import { useDispatch } from 'react-redux'
import { parse } from 'qs'
import isEqual from 'lodash/isEqual'
import { isMobile } from 'react-device-detect'
import classNames from 'classnames'

import { AppBar, Popups } from '../components'
import Web3ReactManager from '../components/Web3ReactManager'
import Routes from '../routes'
import { AppDispatch } from '../state'
import { updateUserDarkMode } from '../state/user/actions'
import SideBar from '../components/SideBar'
import TransactionUpdater from '../state/transactions/updater'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import WalletChat from '../components/WalletChat'
import { useIsSimpleApp } from 'state/simpleapp/simpleapp'

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

const Wrapper = styled.div<{ isSimpleApp?: boolean }>`
    @media ${({ theme }) => theme.media.sm} {
        overflow-y: hidden;
    }
    @media ${({ theme }) => theme.media.md} {
        padding-bottom: ${(props) => (props.isSimpleApp ? '0px' : '75px')};
    }
`

const MainBody = styled.div<{ $page?: string }>`
    ${({ $page }) =>
        $page === '/dashboard' &&
        `
    width: 80%;
    height: 100%;
    padding: 50px 20px 50px 20px;
  `}
    background-color: ${({ theme }) => theme.color.bgBody};
`

const AppWrap = styled.div<{ $isMiniPay?: boolean }>`
    ${({ $isMiniPay }) =>
        $isMiniPay
            ? `
            height: 100vh;
            @supports (height: 100svh) {
                height: 100svh;
            }
          `
            : `
    height: 92vh; // should handle viewport on Safari better
    @media screen and (max-width: 361px) {
        height: 93vh;
    }
    @media screen and (min-width: 376px) {
        height: 94vh;
    }
    @media screen and (min-width: 650px) {
        height: 100vh;
    }

    @supports (height: 100svh) {
        height: 92svh; // should handle viewport on safari better
        @media screen and (max-width: 361px) {
            height: 93svh;
        }
        @media screen and (min-width: 376px) {
            height: 94svh;
        }
        @media screen and (min-width: 650px) {
            height: 100svh;
        }
    }
    `}
`

function App(): JSX.Element {
    const bodyRef = useRef<any>(null)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { location, replace } = useHistory()

    const { search, pathname } = useLocation()

    const dispatch = useDispatch<AppDispatch>()
    const [preservedSource, setPreservedSource] = useState('')
    const sendData = useSendAnalyticsData()

    const isMinipay = window?.ethereum?.isMiniPay

    void useFaucet()

    useEffect(() => {
        sendData({ event: 'goto_page', action: `goto_${pathname}` })
    }, [pathname, sendData])

    useEffect(() => {
        const parsed = parse(search, { parseArrays: false, ignoreQueryPrefix: true })

        if (!isEqual(parsed['utm_source'], preservedSource)) {
            setPreservedSource(parsed['utm_source'] as string)
        }

        if (preservedSource && !search.includes('utm_source')) {
            replace({
                ...location,
                search: search ? search + '&utm_source=' + preservedSource : search + '?utm_source=' + preservedSource,
            })
        }
    }, [preservedSource, location, replace, search])

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTo(0, 0)
        }
    }, [/* used */ pathname])

    useEffect(() => {
        if (!search) return
        if (search.length < 2) return

        const parsed = parse(search, {
            parseArrays: false,
            ignoreQueryPrefix: true,
        })

        const theme = parsed.theme

        if (typeof theme !== 'string') return

        if (theme.toLowerCase() === 'light') {
            dispatch(updateUserDarkMode({ userDarkMode: false }))
        } else if (theme.toLowerCase() === 'dark') {
            dispatch(updateUserDarkMode({ userDarkMode: true }))
        }
    }, [dispatch, search])

    // dont show chat and remove padding for network info if simple app
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isSimpleApp = useIsSimpleApp()

    const isFV = pathname.startsWith('/goodid')
    const isClaim = pathname.startsWith('/claim')
    const isBuy = pathname.startsWith('/buy')
    const isDash = pathname.startsWith('/dashboard')

    const isTwoColumns = isBuy || isClaim

    const mainBodyClasses = classNames(
        'z-0 flex flex-col items-center flex-grow h-full pt-4 pb-4 overflow-x-hidden overflow-y-auto sm:pt-8',
        {
            'flex-start': isFV,
            'justify-between': !isFV,
            'xl:pr-8 xl:pt-10 xl:pl-12 xl:pb-0 px-2': isTwoColumns,
            'md:pt-10 px-4': !isTwoColumns,
        }
    )

    // TODO: Remove styling on this container and handle on each page separately
    const routerContainerClasses = classNames('flex flex-col flex-glow w-full', {
        'md:auto': isDash,
        'md:h-screen:': !isDash,
        'justify-start items-center': !isClaim,
        'flex-col-reverse md:justify-end justify-end': isFV,
        'md:justify-center': !isFV,
    })

    return (
        <Suspense fallback={null}>
            <AppWrap className="flex flex-col overflow-hidden" $isMiniPay={isMinipay}>
                <AppBar />
                <Wrapper isSimpleApp className="flex flex-grow overflow-hidden">
                    {!isMobile && <SideBar />}
                    <MainBody ref={bodyRef} className={mainBodyClasses} $page={location.pathname}>
                        <Popups />
                        <Web3ReactManager>
                            <div className={routerContainerClasses}>
                                <Routes />
                                <TransactionUpdater />
                            </div>
                        </Web3ReactManager>
                    </MainBody>
                </Wrapper>
                {!isSimpleApp && <WalletChat />}
            </AppWrap>
        </Suspense>
    )
}

export default App
