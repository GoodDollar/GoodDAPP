import { ChainId, Currency } from '@sushiswap/sdk'
import React from 'react'
import Logo from '../assets/images/logo.png'
import LogoDark from '../assets/images/logo-dark.png'
import LogoMobile from '../assets/images/logo-mobile.png'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useETHBalances } from '../state/wallet/hooks'
import Web3Network from './Web3Network'
import Web3Status from './Web3Status'
import Web3Faucet from './Web3Faucet'
import { Disclosure } from '@headlessui/react'
import { useLingui } from '@lingui/react'
import styled, { css } from 'styled-components'
import MoreMenu from './Menu'
import { useApplicationTheme } from '../state/application/hooks'
import { ReactComponent as Burger } from '../assets/images/burger.svg'
import { ReactComponent as X } from '../assets/images/x.svg'
import { t } from '@lingui/macro'
import SideBar from './SideBar'
import usePromise from '../hooks/usePromise'
import { g$Price } from '../sdk/apollo'
import LanguageSwitch from "./LanguageSwitch";
import NetworkModal from './NetworkModal'
import AppNotice from './AppNotice'

const AppBarWrapper = styled.header`
    background: ${({ theme }) => theme.color.main};

    ${({ theme }) =>
        theme.darkMode
            ? css`
                  border-bottom: 1px solid rgba(208, 217, 228, 0.483146);
              `
            : css`
                  box-shadow: ${theme.shadow.header};
              `}
    .site-logo {
        height: 29px;
    }

    .mobile-menu-button {
        display: none;
    }

    @media ${({ theme }) => theme.media.md} {
        .actions-wrapper {
            background: ${({ theme }) => theme.color.main};
            box-shadow: ${({ theme }) => (theme.darkMode ? 'none' : theme.shadow.header)};
            border-top: ${({ theme }) => (theme.darkMode ? '1px solid rgba(208, 217, 228, 0.483146)' : 'none')};
            margin: 0 !important;
        }

        .mobile-menu-button {
            display: block;
        }

        .site-logo {
            height: 39px;
        }
    }
`
// TODO: Move and combine with styling for ButtonOutlined
export const DivOutlined = styled.div<{
  size?: 'default' | 'sm'
  error?: boolean
  width?: string
  borderRadius?: string
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ size }) => (size === 'sm' ? '32px' : '42px')};
  width: ${({ width = '100%' }) => width};
  border-radius: ${({ borderRadius = '6px' }) => borderRadius};
  color: ${({ theme }) => theme.color.text2};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.text2};
  cursor: pointer;

  font-style: normal;
  font-weight: 500;
  font-size: ${({ size }) => (size === 'sm' ? '14px' : '16px')};
  line-height: 16px;
  text-align: center;
  user-select: none;

  :disabled {
      opacity: 0.5;
      cursor: auto;
  }
`

function AppBar(): JSX.Element {
    const [theme, setTheme] = useApplicationTheme()
    const { i18n } = useLingui()
    const { account, chainId, library } = useActiveWeb3React()
    const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
    const [G$Price] = usePromise(async () => {
        try {
            const data = await g$Price()
            return data.DAI
        } catch {
            return undefined
        }
    }, [chainId])

    return (
        <AppBarWrapper className="relative z-10 flex flex-row justify-between w-screen flex-nowrap" style={{ flexDirection: 'column' }}>
            <AppNotice text={i18n._(t``)}
                link={['']} show={false}></AppNotice>
            <Disclosure as="nav" className="w-screen gradiant-z-10">
                {({ open }) => (
                    <>
                        <div className="px-4 py-1.5">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={theme === 'dark' ? LogoDark : Logo}
                                            alt="Sushi"
                                            className="hidden w-auto site-logo lg:block"
                                        />
                                        <img src={LogoMobile} alt="Sushi" className="w-auto site-logo lg:hidden" />
                                    </div>
                                </div>

                                <div className="flex flex-row space-x-2">
                                    <div className="flex flex-row items-center space-x-2">
                                        <div className="whitespace-nowrap">
                                            {G$Price ? `1,000G$ = ${G$Price.multiply(1000).toFixed(3)}USD` : ''}
                                        </div>
                                        {chainId && <Web3Faucet />}
                                        <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md mobile-menu-button focus:outline-none">
                                            <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                                            {open ? (
                                                <X title="Close" className="block w-6 h-6" aria-hidden="true" />
                                            ) : (
                                                <Burger title="Burger" className="block w-6 h-6" aria-hidden="true" />
                                            )}
                                        </Disclosure.Button>
                                    </div>
                                    <div className="fixed bottom-0 left-0 flex flex-row items-center justify-center w-full p-4 lg:w-auto lg:relative lg:p-0 actions-wrapper ">
                                        <div className="flex items-center justify-end w-full space-x-2 sm:justify-end">
                                            {library && library.provider.isMetaMask && (
                                                <div className="hidden sm:inline-block">
                                                    <Web3Network />
                                                </div>
                                            )}
                                            {account && chainId && userEthBalance ? (
                                                <DivOutlined className="pr-1">
                                                  <div className="w-auto flex items-center rounded p-0.5 whitespace-nowrap   cursor-pointer select-none pointer-events-auto">
                                                      <div className="px-3 py-2 bold">
                                                          {userEthBalance?.toSignificant(4)}{' '}
                                                          {Currency.getNativeCurrencySymbol(chainId)}
                                                      </div>
                                                      <Web3Status />
                                                  </div>
                                                </DivOutlined>
                                            ) : (
                                                <div className="pr-1">
                                                    <Web3Status />
                                                </div>
                                            )}
                                            <svg
                                                width="29"
                                                height="29"
                                                viewBox="0 0 29 29"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="flex-shrink-0 cursor-pointer select-none"
                                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                            >
                                                {theme === 'dark' ? (
                                                    <path
                                                        d="M24.7564 10.2564V4.24359H18.7436L14.5 0L10.2564 4.24359H4.24359V10.2564L0 14.5L4.24359 18.7436V24.7564H10.2564L14.5 29L18.7436 24.7564H24.7564V18.7436L29 14.5L24.7564 10.2564ZM14.5 22.1923C10.2564 22.1923 6.80769 18.7436 6.80769 14.5C6.80769 10.2564 10.2564 6.80769 14.5 6.80769C18.7436 6.80769 22.1923 10.2564 22.1923 14.5C22.1923 18.7436 18.7436 22.1923 14.5 22.1923ZM14.5 9.37179C11.6667 9.37179 9.37179 11.6667 9.37179 14.5C9.37179 17.3333 11.6667 19.6282 14.5 19.6282C17.3333 19.6282 19.6282 17.3333 19.6282 14.5C19.6282 11.6667 17.3333 9.37179 14.5 9.37179Z"
                                                        fill="#00B0FF"
                                                    />
                                                ) : (
                                                    <path
                                                        d="M24.1667 18.4996L28.1662 14.5L24.1667 10.5004V4.83332H18.4996L14.5 0.83374L10.5004 4.83332H4.83332V10.5004L0.83374 14.5L4.83332 18.4996V24.1667H10.5004L14.5 28.1662L18.4996 24.1667H24.1667V18.4996ZM14.5 21.75V7.24999C18.4996 7.24999 21.75 10.5004 21.75 14.5C21.75 18.4996 18.4996 21.75 14.5 21.75Z"
                                                        fill="#00B0FF"
                                                    />
                                                )}
                                            </svg>

                                            <LanguageSwitch />
                                            <MoreMenu />
                                            <NetworkModal />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel>
                            <SideBar mobile />
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </AppBarWrapper>
    )
}

export default AppBar
