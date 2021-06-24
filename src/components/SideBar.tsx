import React from 'react'
import styled from 'styled-components'
import { NavLink } from './Link'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import TwitterLogo from '../assets/images/twitter.png'
import TelegramLogo from '../assets/images/telegram.png'

const SideBarSC = styled.aside`
    width: 268px;
    background: ${({ theme }) => theme.color.main};
    border-right: 1px solid ${({ theme }) => theme.color.border1};

    nav a {
        display: flex;
        align-items: center;
        color: ${({ theme }) => theme.color.text1};
        margin: 20px 15px 0;
        padding-left: 18px;
        font-weight: 500;
        font-size: 18px;

        &.active {
            font-weight: bold;
            background-color: ${({ theme }) => theme.color.button1};
            border-radius: 7px;
            color: ${({ theme }) => theme.color.text2};
        }
    }

    .social {
        padding: 21px 33px 20px 28px;

        span {
            color: ${({ theme }) => theme.color.text3};
            font-weight: 500;
            font-size: 12px;
        }
    }

    .balance {
        padding: 17px 4px 20px 22px;
        margin: 0 26px 0 20px;
        box-shadow: ${({ theme }) => theme.shadow.wallet};
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
        }
    }
`

export default function SideBar() {
    const { i18n } = useLingui()

    return (
        <SideBarSC className="flex flex-col justify-between">
            <nav>
                <NavLink to={'/swap'}>{i18n._(t`Swap`)}</NavLink>
                <NavLink to={'/stakes'}>{i18n._(t`Stakes`)}</NavLink>
                <NavLink to={'/portfolio'}>{i18n._(t`Portfolio`)}</NavLink>
            </nav>
            <div>
                <div className="balance">
                    <div className="title flex justify-between items-center">
                        <span>Wallet balance</span>
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="17" cy="17" r="17" fill="url(#paint0_radial)" />
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
                    <div className="details">
                        <div>
                            G$ - / - <br />
                            GDX - <br />
                            GDAO -
                        </div>
                    </div>
                </div>
                <div className="social flex justify-between">
                    <a href="#" className="flex items-center space-x-2">
                        <img src={TwitterLogo} alt="twitter logo" width="24" height="24" />
                        <span>Twitter</span>
                    </a>

                    <a href="#" className="flex items-center space-x-2">
                        <img src={TelegramLogo} alt="telegram logo" width="24" height="24" />
                        <span>Telegram</span>
                    </a>
                </div>
            </div>
        </SideBarSC>
    )
}
