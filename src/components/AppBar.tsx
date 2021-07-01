import { ChainId, Currency } from '@sushiswap/sdk'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Logo from '../assets/images/logo.png'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useETHBalances } from '../state/wallet/hooks'
import Web3Network from './Web3Network'
import Web3Status from './Web3Status'
import Web3Faucet from './Web3Faucet'
import { Disclosure } from '@headlessui/react'
import { useLingui } from '@lingui/react'
import styled from 'styled-components'
import { ButtonOutlined } from './gd/Button'
import MoreMenu from './Menu'

const AppBarWrapper = styled.header`
    background: ${({ theme }) => theme.color.main};
    box-shadow: ${({ theme }) => theme.shadow.header};

    .site-logo {
        height: 29px;
    }
`

function AppBar(): JSX.Element {
    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()
    const { pathname } = useLocation()

    const [navClassList, setNavClassList] = useState('w-screen gradiant-z-10 backdrop-filter backdrop-blur')

    const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

    useEffect(() => {
        if (pathname === '/trade') {
            setNavClassList('w-screen z-10 backdrop-filter backdrop-blur')
        } else {
            setNavClassList('w-screen gradiant-z-10 backdrop-filter backdrop-blur')
        }
    }, [pathname])

    return (
        <AppBarWrapper className="flex flex-row flex-nowrap justify-between w-screen relative z-10">
            <Disclosure as="nav" className={navClassList}>
                {({ open }) => (
                    <>
                        <div className="px-4 py-1.5">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <img src={Logo} alt="Sushi" className="site-logo w-auto" />
                                    </div>
                                </div>

                                <div className="flex flex-row items-center justify-center w-full lg:w-auto p-4 fixed left-0 bottom-0 lg:relative lg:p-0 ransparent">
                                    <div className="flex items-center justify-between sm:justify-end space-x-2 w-full">
                                        <div className="whitespace-nowrap">G$ = 1USD</div>
                                        {chainId &&
                                            [ChainId.GÖRLI, ChainId.KOVAN, ChainId.RINKEBY, ChainId.ROPSTEN].includes(
                                                chainId
                                            ) && <Web3Faucet />}
                                        {library && library.provider.isMetaMask && (
                                            <div className="hidden sm:inline-block">
                                                <Web3Network />
                                            </div>
                                        )}

                                        <ButtonOutlined className="pr-1">
                                            <div className="w-auto flex items-center rounded p-0.5 whitespace-nowrap   cursor-pointer select-none pointer-events-auto">
                                                {account && chainId && userEthBalance && (
                                                    <>
                                                        <div className="py-2 px-3  bold">
                                                            {userEthBalance?.toSignificant(4)}{' '}
                                                            {Currency.getNativeCurrencySymbol(chainId)}
                                                        </div>
                                                    </>
                                                )}
                                                <Web3Status />
                                            </div>
                                        </ButtonOutlined>
                                        <svg
                                            width="29"
                                            height="29"
                                            viewBox="0 0 29 29"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="flex-shrink-0"
                                        >
                                            <path
                                                d="M24.1667 18.4996L28.1662 14.5L24.1667 10.5004V4.83332H18.4996L14.5 0.83374L10.5004 4.83332H4.83332V10.5004L0.83374 14.5L4.83332 18.4996V24.1667H10.5004L14.5 28.1662L18.4996 24.1667H24.1667V18.4996ZM14.5 21.75V7.24999C18.4996 7.24999 21.75 10.5004 21.75 14.5C21.75 18.4996 18.4996 21.75 14.5 21.75Z"
                                                fill="#00B0FF"
                                            />
                                        </svg>

                                        {/*<LanguageSwitch />*/}
                                        <MoreMenu />
                                    </div>
                                </div>
                                {/*<div className="-mr-2 flex sm:hidden">
                                     Mobile menu button
                                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md   focus:outline-none">
                                        <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                                        {open ? (
                                            <X title="Close" className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Burger title="Burger" className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>*/}
                            </div>
                        </div>

                        {/*<Disclosure.Panel className="sm:hidden">
                            <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                                 Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white"
                                 <a
                                href="#"
                                className="bg-gray-1000 text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Dashboard
                            </a>

                                <NavLink id={`swap-nav-link`} to={'/swap'}>
                                    {i18n._(t`Swap`)}
                                </NavLink>
                                <NavLink
                                    id={`pool-nav-link`}
                                    to={'/pool'}
                                    isActive={(match, { pathname }) =>
                                        Boolean(match) ||
                                        pathname.startsWith('/add') ||
                                        pathname.startsWith('/remove') ||
                                        pathname.startsWith('/create') ||
                                        pathname.startsWith('/find')
                                    }
                                >
                                    {i18n._(t`Pool`)}
                                </NavLink>

                                {chainId && [ChainId.MAINNET, ChainId.MATIC].includes(chainId) && (
                                    <NavLink id={`yield-nav-link`} to={'/yield'}>
                                        {i18n._(t`Yield`)}
                                    </NavLink>
                                )}
                                {chainId &&
                                    [ChainId.MAINNET, ChainId.KOVAN, ChainId.BSC, ChainId.MATIC].includes(chainId) && (
                                        <NavLink id={`kashi-nav-link`} to={'/bento/kashi/lend'}>
                                            {i18n._(t`Kashi Lending`)}
                                        </NavLink>
                                    )}
                                {chainId &&
                                    [ChainId.MAINNET, ChainId.KOVAN, ChainId.BSC, ChainId.MATIC].includes(chainId) && (
                                        <NavLink id={`bento-nav-link`} to={'/bento'}>
                                            {i18n._(t`BentoBox`)}
                                        </NavLink>
                                    )}
                                {chainId === ChainId.MAINNET && (
                                    <NavLink id={`stake-nav-link`} to={'/sushibar'}>
                                        {i18n._(t`SushiBar`)}
                                    </NavLink>
                                )}
                                {chainId === ChainId.MAINNET && (
                                    <ExternalLink id={`stake-nav-link`} href={'https://miso.sushi.com'}>
                                        {i18n._(t`Miso`)}
                                    </ExternalLink>
                                )}
                                {chainId === ChainId.MAINNET && (
                                    <NavLink id={`vesting-nav-link`} to={'/vesting'}>
                                        {i18n._(t`Vesting`)}
                                    </NavLink>
                                )}
                                {chainId &&
                                    [
                                        ChainId.MAINNET,
                                        ChainId.BSC,
                                        ChainId.XDAI,
                                        ChainId.FANTOM,
                                        ChainId.MATIC,
                                    ].includes(chainId) && (
                                        <ExternalLink
                                            id={`analytics-nav-link`}
                                            href={ANALYTICS_URL[chainId] || 'https://analytics.sushi.com'}
                                        >
                                            {i18n._(t`Analytics`)}
                                        </ExternalLink>
                                    )}
                            </div>
                        </Disclosure.Panel>*/}
                    </>
                )}
            </Disclosure>
        </AppBarWrapper>
    )
}

export default AppBar
