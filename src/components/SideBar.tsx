import { useG$Balance, useG$Tokens, AsyncStorage, SupportedV2Networks } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import WalletBalance from 'components/WalletBalance'
import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import DiscordLogo from '../assets/images/discord-logo-new.png'
import TelegramLogo from '../assets/images/telegram.png'
import TwitterLogo from '../assets/images/twitter.png'
import useActiveWeb3React from '../hooks/useActiveWeb3React'
import useMetaMask from '../hooks/useMetaMask'
import { useApplicationTheme } from '../state/application/hooks'
import LanguageSwitch from './LanguageSwitch'
import { NavLink } from './Link'
import usePromise from '../hooks/usePromise'

const SideBarSC = styled.aside<{ $mobile?: boolean }>`
    width: ${({ $mobile }) => ($mobile ? '90%' : '268px')};
    background: ${({ theme }) => theme.color.main};
    flex-shrink: 0;
    border-right: 1px solid rgba(208, 217, 228, 0.482);
    height: ${({ $mobile }) => ($mobile ? '100%' : 'auto')};

    @media screen and (max-height: 670px) {
        overflow-x: scroll;
        .sidebar-inner-container {
            overflow-x: visible;
        }
    }
    @media screen and (max-height: 610px) {
        .sidebar-inner-container {
            overflow-x: scroll;
        }
    }

    @media screen and (max-height: 900px) {
        .sidebar-inner-container {
            transform: scale(0.9);
            margin-top: -25px;
        }

        .balance {
            padding: 10px 7px 5px 22px;
        }

        nav a {
            margin: 5px 15px 0;
        }
    }
    @media screen and (min-height: 901px) {
        .balance {
            padding: 17px 7px 5px 22px;
        }

        nav a {
            margin: 20px 15px 0;
        }
    }

    nav a {
        display: flex;
        align-items: center;
        color: ${({ theme }) => theme.color.text1};
        padding-left: 18px;
        font-weight: 500;
        font-size: 18px;

        &.active,
        &:hover {
            background-color: ${({ theme }) => theme.color.button1};
            border-radius: 7px;
        }

        &.active {
            font-weight: bold;
            color: ${({ theme }) => theme.color.text2};
        }
    }

    .social {
        padding: 21px 33px 20px 28px;

        span {
            color: ${({ theme }) => theme.color.text3};
            font-weight: 500;
            font-size: 13px;
            padding-top: 2px;
        }
    }

    .app-settings {
        padding: 5px;
        border-top: 1px solid rgba(208, 217, 228, 0.482);
        padding-top: 15px;
    }

    .balance {
        margin: 0 26px 0 20px;
        // ${({ theme, $mobile }) => (theme.darkMode && !$mobile ? 'border: 1px solid #A5A5A5;' : '')};
        box-shadow: ${({ theme, $mobile }) => (!$mobile ? theme.shadow.wallet : '')};
        border-radius: 23px;

        .title {
            font-weight: bold;
            font-size: 18px;
            line-height: 21px;
            color: ${({ theme }) => theme.color.text1};
        }

        .details {
            margin-top: 5px;
            font-size: 18px;
            line-height: 21px;

            div {
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }

        .importToMetamaskLink {
            text-decoration: underline;
            color: #0094ec;
            font-size: 0.75em;
            font-weight: 500;
            cursor: pointer;
        }
    }

    ${({ $mobile }) =>
        $mobile
            ? css`
                  border-top: 1px solid ${({ theme }) => theme.color.border3};

                  .sidebar-inner-container {
                      transform: scale(0.9);
                      margin-top: -15px;
                  }

                  .balance {
                      padding-left: 13px;
                      margin-bottom: 15px;
                      .title {
                          padding-bottom: 17px;
                      }
                  }

                  nav {
                      a {
                          margin: 10px 15px 0;
                      }
                      border-top: 1px solid ${({ theme }) => theme.color.border3};
                      border-bottom: 1px solid ${({ theme }) => theme.color.border3};
                      padding-bottom: 20px;
                  }

                  .social {
                      max-width: 300px;
                  }
              `
            : ''}

    display: ${({ $mobile }) => ($mobile ? 'none' : 'flex')};

    @media ${({ theme }) => theme.media.md} {
        display: ${({ $mobile }) => ($mobile ? 'block' : 'none')};
    }
`

const SocialsLink: React.FC<{ network: string; logo: string; url: string }> = ({ network, logo, url }) => (
    <a href={url} target="_blank" className="flex items-center space-x-2" rel="noreferrer">
        <img src={logo} alt={`${network} logo`} width="24" height="24" />
    </a>
)

const ExternalLink: React.FC<{ label: string; url: string }> = ({ label, url }) => (
    <a className="p-2 line md:p-1 xl:p-3 whitespace-nowrap" href={url} target="_blank" rel="noreferrer">
        <span>{label}</span>
        <svg className="ml-2" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.4444 11.6667V7C12.4444 6.57067 12.792 6.22222 13.2221 6.22222C13.6523 6.22222 13.9999 6.57067 13.9999 7V11.6667C13.9999 12.9531 12.953 14 11.6666 14H2.33332C1.04688 14 0 12.9531 0 11.6667V2.33333C0 1.04689 1.04688 0 2.33332 0H6.99996C7.43007 0 7.77773 0.348444 7.77773 0.777778C7.77773 1.20711 7.43007 1.55556 6.99996 1.55556H2.33332C1.90399 1.55556 1.55555 1.90478 1.55555 2.33333V11.6667C1.55555 12.0952 1.90399 12.4444 2.33332 12.4444H11.6666C12.0959 12.4444 12.4444 12.0952 12.4444 11.6667ZM11.3385 1.56178L10.1073 1.55556C9.67716 1.55322 9.33105 1.20322 9.33338 0.773889C9.33571 0.345333 9.68338 0 10.1112 0H10.115L13.2238 0.0155556C13.6516 0.0178889 13.9977 0.364778 13.9977 0.792556L14 3.88811C14 4.31822 13.6524 4.66667 13.223 4.66667H13.2222C12.7929 4.66667 12.4445 4.319 12.4445 3.88967L12.4437 2.65611L7.54995 7.54989C7.39828 7.70156 7.19917 7.77778 7.00006 7.77778C6.80095 7.77778 6.60184 7.70156 6.45017 7.54989C6.14606 7.24578 6.14606 6.75422 6.45017 6.45011L11.3385 1.56178Z"
                fill="#00B0FF"
            />
        </svg>
    </a>
)

export default function SideBar({ mobile, closeSidebar }: { mobile?: boolean; closeSidebar?: any }) {
    const [theme, setTheme] = useApplicationTheme()
    const { i18n } = useLingui()
    const { ethereum } = window
    const { chainId, account } = useActiveWeb3React()
    const metaMaskInfo = useMetaMask()
    const balances = useG$Balance(10)
    const { g$, good, gdx } = useG$Tokens()
    const [imported, setImported] = useState<boolean>(false)

    const importToMetamask = async () => {
        const allTokens = []
        if (g$)
            allTokens.push({
                type: 'ERC20',
                options: {
                    address: g$.address,
                    symbol: g$.ticker,
                    decimals: g$.decimals,
                    image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
                },
            })

        if (good)
            allTokens.push({
                type: 'ERC20',
                options: {
                    address: good.address,
                    symbol: good.ticker,
                    decimals: good.decimals,
                    image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
                },
            })

        if (!SupportedV2Networks[chainId] && gdx)
            allTokens.push({
                type: 'ERC20',
                options: {
                    address: gdx.address,
                    symbol: gdx.ticker,
                    decimals: gdx.decimals,
                    image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gdx-logo.png',
                },
            })

        Promise.all(
            allTokens.map(async (token) => {
                // todo: fix multiple requests bug after succesfully adding all assets.
                //IE. wallet_watchAsset auto triggered when switching chain
                metaMaskInfo.isMultiple
                    ? ethereum?.selectedProvider?.request &&
                      (await ethereum.selectedProvider.request({
                          method: 'wallet_watchAsset',
                          params: token,
                      }))
                    : ethereum?.request &&
                      (await ethereum.request({
                          method: 'wallet_watchAsset',
                          params: token,
                      }))
            })
        )
            .then(async (results) => {
                setImported(true)
                await AsyncStorage.setItem(`${chainId}_metamask_import_status`, true)
            })
            .catch((errors) => {
                // console.log(errors)
            })
    }

    const [loading] = usePromise(async () => {
        const imported = await AsyncStorage.getItem(`${chainId}_metamask_import_status`)
        setImported(imported)
        return imported
    }, [chainId])

    return (
        <SideBarSC className="flex flex-col justify-between" $mobile={mobile}>
            <div className="sidebar-inner-container">
                {account && (
                    <div className="balance">
                        <div className="flex items-center justify-between title">
                            <span>{i18n._(t`Wallet balance`)}</span>
                            <svg
                                width="34"
                                height="34"
                                viewBox="0 0 34 34"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="17" cy="17" r="17" fill="#1166E8" />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16.8667 10.6L21.2667 9L21.8533 10.6H16.8667ZM20.2 15.9333H24.4667C24.7612 15.9333 25 16.1721 25 16.4667V18.6C25 18.8946 24.7612 19.1333 24.4667 19.1333H20.2C19.9054 19.1333 19.6667 18.8946 19.6667 18.6V16.4667C19.6667 16.1721 19.9054 15.9333 20.2 15.9333ZM21 18.0667C20.7054 18.0667 20.4667 17.8279 20.4667 17.5333C20.4667 17.2388 20.7054 17 21 17C21.2946 17 21.5333 17.2388 21.5333 17.5333C21.5333 17.8279 21.2946 18.0667 21 18.0667ZM18.6 16.4667V18.6C18.6 19.4837 19.3163 20.2 20.2 20.2H23.9333V22.6C23.9333 23.0418 23.5752 23.4 23.1333 23.4H9.8C9.35817 23.4 9 23.0418 9 22.6V12.4667C9 12.0248 9.35817 11.6667 9.8 11.6667H23.1333C23.5752 11.6667 23.9333 12.0248 23.9333 12.4667V14.8667H20.2C19.3163 14.8667 18.6 15.583 18.6 16.4667ZM20.2 12.7333H19.6667C19.3721 12.7333 19.1333 12.9721 19.1333 13.2667C19.1333 13.5612 19.3721 13.8 19.6667 13.8H20.2C20.4946 13.8 20.7333 13.5612 20.7333 13.2667C20.7333 12.9721 20.4946 12.7333 20.2 12.7333ZM11.6667 13.8C11.3721 13.8 11.1333 13.5612 11.1333 13.2667C11.1333 12.9721 11.3721 12.7333 11.6667 12.7333H12.2C12.4946 12.7333 12.7333 12.9721 12.7333 13.2667C12.7333 13.5612 12.4946 13.8 12.2 13.8H11.6667ZM12.7333 22.3333H13.2667C13.5612 22.3333 13.8 22.0946 13.8 21.8C13.8 21.5054 13.5612 21.2667 13.2667 21.2667H12.7333C12.4388 21.2667 12.2 21.5054 12.2 21.8C12.2 22.0946 12.4388 22.3333 12.7333 22.3333ZM14.3333 13.8C14.0388 13.8 13.8 13.5612 13.8 13.2667C13.8 12.9721 14.0388 12.7333 14.3333 12.7333H14.8667C15.1612 12.7333 15.4 12.9721 15.4 13.2667C15.4 13.5612 15.1612 13.8 14.8667 13.8H14.3333ZM15.4 22.3333H15.9333C16.2279 22.3333 16.4667 22.0946 16.4667 21.8C16.4667 21.5054 16.2279 21.2667 15.9333 21.2667H15.4C15.1054 21.2667 14.8667 21.5054 14.8667 21.8C14.8667 22.0946 15.1054 22.3333 15.4 22.3333ZM17 13.8C16.7054 13.8 16.4667 13.5612 16.4667 13.2667C16.4667 12.9721 16.7054 12.7333 17 12.7333H17.5333C17.8279 12.7333 18.0667 12.9721 18.0667 13.2667C18.0667 13.5612 17.8279 13.8 17.5333 13.8H17ZM18.0667 22.3333H18.6C18.8946 22.3333 19.1333 22.0946 19.1333 21.8C19.1333 21.5054 18.8946 21.2667 18.6 21.2667H18.0667C17.7721 21.2667 17.5333 21.5054 17.5333 21.8C17.5333 22.0946 17.7721 22.3333 18.0667 22.3333ZM20.2 21.8C20.2 21.5054 20.4388 21.2667 20.7333 21.2667H21.2667C21.5612 21.2667 21.8 21.5054 21.8 21.8C21.8 22.0946 21.5612 22.3333 21.2667 22.3333H20.7333C20.4388 22.3333 20.2 22.0946 20.2 21.8Z"
                                    fill="white"
                                />
                                <defs>
                                    <radialGradient
                                        id="paint0_radial"
                                        cx="0"
                                        cy="0"
                                        r="1"
                                        gradientUnits="userSpaceOnUse"
                                        gradientTransform="translate(6.14237 3.49326) rotate(90) scale(34)"
                                    >
                                        <stop stopColor="#1E93F4" />
                                        <stop offset="1" stopColor="#0D5AE5" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="flex flex-col details">
                            {account && <WalletBalance balances={balances} chainId={chainId} />}
                            <br />
                            {!loading && !imported && (
                                <div className="importToMetamaskLink" onClick={importToMetamask}>
                                    Import to Metamask
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <nav className="mt-5">
                    <NavLink to={'/dashboard'} onClick={mobile ? closeSidebar : null}>
                        {i18n._(t`Dashboard`)}
                    </NavLink>
                    <NavLink to={'/swap'} onClick={mobile ? closeSidebar : null}>
                        {i18n._(t`Swap`)}
                    </NavLink>
                    <NavLink to={'/stakes'} onClick={mobile ? closeSidebar : null}>
                        {i18n._(t`Stake`)}
                    </NavLink>
                    <NavLink to={'/portfolio'} onClick={mobile ? closeSidebar : null}>
                        {i18n._(t`Portfolio`)}
                    </NavLink>
                    <NavLink to={'/claim'} onClick={mobile ? closeSidebar : null}>
                        {i18n._(t`Claim`)}
                    </NavLink>
                    {/* <NavLink to={'/savings'} onClick={mobile ? closeSidebar : null}>{i18n._(t`Savings`)}</NavLink> -- v2 */}
                    <ExternalLink label={i18n._(t`Wallet`)} url="https://wallet.gooddollar.org/" />
                    <ExternalLink label={i18n._(t`Fuse Bridge`)} url="https://app.fuse.fi/#/bridge" />
                    <ExternalLink label={i18n._(t`Docs`)} url="https://docs.gooddollar.org" />
                </nav>

                <div className="flex items-center justify-between social">
                    <span>Follow us on:</span>
                    <SocialsLink network="twitter" logo={TwitterLogo} url="https://twitter.com/gooddollarorg" />
                    <SocialsLink network="telegram" logo={TelegramLogo} url="https://t.me/GoodDollarX" />
                    <SocialsLink network="discord" logo={DiscordLogo} url="https://discord.gg/RKVHwdQtme" />
                </div>

                <div className="flex flex-row justify-center app-settings">
                    <div className="flex items-center justify-center mr-10">
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
                    </div>
                    <LanguageSwitch />
                </div>
            </div>
        </SideBarSC>
    )
}
