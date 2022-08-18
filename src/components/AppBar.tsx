import { ChainId, Currency } from '@sushiswap/sdk'
import React, {useState, useCallback} from 'react'
import Logo from '../assets/images/logo.png'
import LogoDark from '../assets/images/logo-dark.png'
import LogoMobile from '../assets/images/logo-mobile.png'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useETHBalances } from '../state/wallet/hooks'
import Web3Network from './Web3Network'
import Web3Status from './Web3Status'
import Web3Faucet from './Web3Faucet'
import { useLingui } from '@lingui/react'
import styled, { css } from 'styled-components'
import { useApplicationTheme } from '../state/application/hooks'
import { ReactComponent as Burger } from '../assets/images/burger.svg'
import { ReactComponent as X } from '../assets/images/x.svg'
import { t } from '@lingui/macro'
import SideBar from './SideBar'
import usePromise from '../hooks/usePromise'
import { g$Price } from '@gooddollar/web3sdk'
import NetworkModal from './NetworkModal'
import AppNotice from './AppNotice'
import { isMobile } from 'react-device-detect'

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
export const LogoWrapper = styled.div<{ $mobile: boolean}>`

  ${({theme, $mobile}) => theme.darkMode && $mobile && (`
      background-color: white;
      position: absolute;
      height: 36px;
      width: 36px;
      border-radius: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
    `)}
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
const SidebarContainer = styled.div<{ $mobile: boolean}>`
${({ $mobile }) => ( $mobile && (
`  top: 75px;
  width: 75%;
  height: 95%;
  left: -806px;
  position: fixed;
  transition: transform 1s ease;
  z-index: 11;
  &.open {
    transition: transform 1s ease;
    transform: translateX(806px)
  }`
))}`

const SidebarOverlay = styled.div`
  z-index: 0;
  opacity: 0;
  transition: all 0.5s ease;
  &.open {
    top: 75px;
    transition: all 0.5s ease;
    opacity: 1;
    background-color: #3c3c3c3c;
    z-index: 10;
    height: 100%;
  }
`

function AppBar(): JSX.Element {
    const [theme, setTheme] = useApplicationTheme()
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const userEthBalance = useETHBalances((account ? [account] : []), chainId)?.[account ?? '']
    const [G$Price] = usePromise(async () => {
        try {
          // const data = '0.0000'
            const data = await g$Price()
            return data.DAI
        } catch {
            return undefined
        }
    }, [chainId])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const closeSideBar = useCallback(() => {
      setSidebarOpen(!sidebarOpen)
    }, [sidebarOpen])

    return (
        <AppBarWrapper className="relative z-10 flex flex-row justify-between w-screen flex-nowrap" style={{ flexDirection: 'column' }}>
            <AppNotice text={i18n._(t``)}
                link={['']} show={false}></AppNotice>
                  <>
                  <div className="md:px-4 pl-2.5 pr-1 py-1.5">
                      <div className="flex items-center justify-between h-16">
                          <div className="flex items-center">
                              <LogoWrapper $mobile={isMobile} className="flex-shrink-0">
                                  <img
                                      src={theme === 'dark' ? LogoDark : Logo}
                                      alt="GoodDollar"
                                      className="hidden w-auto site-logo lg:block"
                                  />
                                  <img src={LogoMobile} alt="GoodDollar" className="w-auto h-7 lg:hidden" />
                              </LogoWrapper>
                          </div>

                          <div className="flex flex-row space-x-2">
                              <div className="flex flex-row items-center space-x-2">
                                  <div className="ml-10 text-sm whitespace-nowrap lg:text-base">
                                      {G$Price ? `1,000G$ = ${G$Price.multiply(1000).toFixed(3)}USD` : ''}
                                  </div>
                                  {chainId && <Web3Faucet />}
                                  <button onClick={() => { setSidebarOpen(!sidebarOpen)}} 
                                    className="inline-flex items-center justify-center p-2 rounded-md mobile-menu-button focus:outline-none">
                                      <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                                      {sidebarOpen ? (
                                          <X title="Close" className="block w-6 h-6" aria-hidden="true" />
                                      ) : (
                                          <Burger title="Burger" className="block w-6 h-6" aria-hidden="true" />
                                      )}
                                  </button>
                              </div>
                              <div className="fixed bottom-0 left-0 flex flex-row items-center justify-center w-full p-4 lg:w-auto lg:relative lg:p-0 actions-wrapper ">
                                  <div className="flex items-center justify-center w-full space-x-2 sm:justify-center">
                                      <div className="hidden xs:inline-block">
                                        <Web3Network />
                                      </div>
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
                                    <NetworkModal />
                                  </div> 
                              </div>
                          </div>
                      </div>
                  </div>

                  <SidebarContainer $mobile={isMobile} className={`lg:hidden ${sidebarOpen ? ' open ' : ''}`}> 
                    <SideBar mobile={isMobile} closeSidebar={closeSideBar} />
                  </SidebarContainer>
                  <SidebarOverlay 
                    id="overlay"
                    onClick={closeSideBar} 
                    className={`fixed lg:hidden w-full ${sidebarOpen ? ' open ' : ''}`}></SidebarOverlay>
            </>
        </AppBarWrapper>
    )
}

export default AppBar
