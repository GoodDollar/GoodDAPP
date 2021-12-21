import { MenuFlyout, StyledMenu, StyledMenuButton } from 'components/StyledMenu'
import React, { useContext, useRef, useState } from 'react'
import { Settings, X } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/types'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
    useExpertModeManager,
    useUserSingleHopOnly,
    useUserSlippageTolerance,
    useUserTransactionTTL
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { ButtonError } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const StyledMenuIcon = styled(Settings)`
    height: 20px;
    width: 20px;

    > * {
        stroke: ${({ theme }) => theme.text2};
    }

    :hover {
        opacity: 0.7;
    }
`

const StyledCloseIcon = styled(X)`
    height: 20px;
    width: 20px;
    :hover {
        cursor: pointer;
    }

    > * {
        stroke: ${({ theme }) => theme.text1};
    }
`

const EmojiWrapper = styled.div`
    position: absolute;
    bottom: -6px;
    right: 0px;
    font-size: 14px;
`

const Break = styled.div`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    background-color: ${({ theme }) => theme.bg2};
    border-radius: 10px;
`

const ExtendedMenuFlyout = styled(MenuFlyout)`
    width: 400px;
    max-width: calc(100vw - 32px);
    box-sizing: border-box;

    @media ${({ theme }) => theme.media.md} {
        right: -20px;
    }

    .title {
        font-weight: 900;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.1px;
        color: ${({ theme }) => theme.color.text1};
    }

    .sub-title {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.35px;
        color: ${({ theme }) => theme.color.text5};
    }
`

export default function SettingsTab() {
    const { i18n } = useLingui()

    const node = useRef<HTMLDivElement>(null)
    const open = useModalOpen(ApplicationModal.SETTINGS)
    const toggle = useToggleSettingsMenu()

    const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

    const [ttl, setTtl] = useUserTransactionTTL()

    const [expertMode, toggleExpertMode] = useExpertModeManager()

    const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

    // show confirmation view before turning on
    const [showConfirmation, setShowConfirmation] = useState(false)

    useOnClickOutside(node, open ? toggle : undefined)

    return (
        <StyledMenu ref={node}>
            {/*<Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
                <ModalContentWrapper>
                    <AutoColumn gap="lg">
                        <RowBetween style={{ padding: '0 2rem' }}>
                            <div />
                            <Text fontWeight={500} fontSize={20}>
                                {i18n._(t`Are you sure?`)}
                            </Text>
                            <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
                        </RowBetween>
                        <Break />
                        <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
                            <Text fontWeight={500} fontSize={20}>
                                {t`Expert mode turns off the confirm transaction prompt and allows high slippage trades
                                that often result in bad rates and lost funds.`}
                            </Text>
                            <Text fontWeight={600} fontSize={20}>
                                {i18n._(t`ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.`)}
                            </Text>
                            <ButtonError
                                error={true}
                                padding={'12px'}
                                onClick={() => {
                                    if (
                                        window.prompt(
                                            i18n._(t`Please type the word "confirm" to enable expert mode.`)
                                        ) === 'confirm'
                                    ) {
                                        toggleExpertMode()
                                        setShowConfirmation(false)
                                    }
                                }}
                            >
                                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                                    {i18n._(t`Turn On Expert Mode`)}
                                </Text>
                            </ButtonError>
                        </AutoColumn>
                    </AutoColumn>
                </ModalContentWrapper>
            </Modal>*/}
            <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
                <div className="wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M23.6256 10.4952C23.4336 10.3728 21.9192 9.46799 21.3192 9.19199L20.5752 7.392C20.796 6.7968 21.2208 5.1288 21.2952 4.8384C21.325 4.70624 21.3208 4.56868 21.283 4.43857C21.2453 4.30846 21.1751 4.19005 21.0792 4.0944L19.9056 2.928C19.8102 2.83168 19.6918 2.76129 19.5616 2.72349C19.4314 2.68569 19.2937 2.68174 19.1616 2.712C18.9408 2.7624 17.2416 3.192 16.608 3.432L14.808 2.688C14.5464 2.112 13.6656 0.636 13.5048 0.3816C13.4337 0.265175 13.3339 0.168947 13.215 0.102132C13.0961 0.0353158 12.962 0.000149492 12.8256 0L11.1744 0C11.0388 6.79292e-05 10.9054 0.0344302 10.7867 0.0998903C10.6679 0.16535 10.5676 0.259782 10.4952 0.3744C10.3728 0.5664 9.46799 2.0808 9.19199 2.6808L7.39199 3.4248C6.79679 3.204 5.12879 2.7792 4.8384 2.7048C4.70623 2.675 4.56868 2.67918 4.43857 2.71695C4.30846 2.75472 4.19005 2.82486 4.0944 2.9208L2.928 4.0944C2.83168 4.18979 2.76129 4.30819 2.72349 4.43838C2.68569 4.56857 2.68174 4.70625 2.712 4.8384C2.7624 5.0592 3.192 6.7584 3.432 7.392L2.688 9.19199C2.112 9.45359 0.635999 10.3344 0.3816 10.4952C0.265175 10.5663 0.168947 10.6661 0.102131 10.785C0.0353158 10.9039 0.000149492 11.038 0 11.1744L0 12.8232C6.79292e-05 12.9588 0.0344302 13.0922 0.0998902 13.2109C0.16535 13.3297 0.259782 13.4299 0.3744 13.5024C0.566399 13.6248 2.0808 14.5296 2.6808 14.8056L3.4248 16.6056C3.204 17.2008 2.7792 18.8688 2.7048 19.1592C2.675 19.2914 2.67918 19.4289 2.71695 19.559C2.75472 19.6891 2.82485 19.8075 2.9208 19.9032L4.0872 21.0696C4.18259 21.1659 4.30099 21.2363 4.43118 21.2741C4.56137 21.3119 4.69905 21.3158 4.83119 21.2856C5.05199 21.2352 6.75119 20.8056 7.38479 20.5656L9.18479 21.3096C9.44639 21.8856 10.3272 23.3616 10.488 23.616C10.5594 23.7339 10.6602 23.8313 10.7805 23.8986C10.9008 23.9659 11.0365 24.0008 11.1744 24H12.8232C12.9588 23.9999 13.0922 23.9656 13.2109 23.9001C13.3297 23.8346 13.4299 23.7402 13.5024 23.6256C13.6248 23.4336 14.5296 21.9192 14.8056 21.3192L16.6056 20.5752C17.2008 20.796 18.8688 21.2208 19.1592 21.2952C19.2913 21.325 19.4289 21.3208 19.559 21.283C19.6891 21.2453 19.8075 21.1751 19.9032 21.0792L21.0696 19.9128C21.1659 19.8174 21.2363 19.699 21.2741 19.5688C21.3119 19.4386 21.3158 19.3009 21.2856 19.1688C21.2352 18.948 20.8056 17.2488 20.5656 16.6152L21.3096 14.8152C21.8856 14.5536 23.3616 13.6728 23.616 13.512C23.7339 13.4406 23.8313 13.3398 23.8986 13.2195C23.9659 13.0992 24.0008 12.9634 24 12.8256V11.1744C24.001 11.0386 23.9672 10.9048 23.9016 10.7858C23.836 10.6669 23.741 10.5668 23.6256 10.4952V10.4952ZM12 17.2248C10.9657 17.2238 9.95487 16.9162 9.09539 16.3408C8.23592 15.7654 7.56638 14.948 7.17144 13.992C6.7765 13.0361 6.6739 11.9845 6.87662 10.9702C7.07934 9.95599 7.57826 9.02462 8.3103 8.29392C9.04235 7.56322 9.97463 7.066 10.9893 6.86515C12.0039 6.6643 13.0553 6.76882 14.0105 7.16552C14.9657 7.56221 15.7819 8.23325 16.3557 9.09378C16.9295 9.95431 17.2353 10.9657 17.2344 12C17.2312 13.3864 16.6784 14.7149 15.6972 15.6944C14.7159 16.6738 13.3864 17.2242 12 17.2248Z"
                            fill="#00B0FF"
                        />
                    </svg>
                </div>
            </StyledMenuButton>
            {open && (
                <ExtendedMenuFlyout>
                    <AutoColumn gap="md">
                        <div className="title">{i18n._(t`Transaction Settings`)}</div>
                        <TransactionSettings
                            rawSlippage={userSlippageTolerance}
                            setRawSlippage={setUserslippageTolerance}
                            deadline={ttl}
                            setDeadline={setTtl}
                        />
                        {/*<div className="  ">{i18n._(t`Interface Settings`)}</div>
                        <RowBetween>
                            <RowFixed>
                                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                                    {i18n._(t`Toggle Expert Mode`)}
                                </TYPE.black>
                                <QuestionHelper
                                    text={i18n._(
                                        t`Bypasses confirmation modals and allows high slippage trades. Use at your own risk.`
                                    )}
                                />
                            </RowFixed>
                            <Toggle
                                id="toggle-expert-mode-button"
                                isActive={expertMode}
                                toggle={
                                    expertMode
                                        ? () => {
                                              toggleExpertMode()
                                              setShowConfirmation(false)
                                          }
                                        : () => {
                                              toggle()
                                              setShowConfirmation(true)
                                          }
                                }
                            />
                        </RowBetween>
                        <RowBetween>
                            <RowFixed>
                                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                                    {i18n._(t`Disable Multihops`)}
                                </TYPE.black>
                                <QuestionHelper text={i18n._(t`Restricts swaps to direct pairs only.`)} />
                            </RowFixed>
                            <Toggle
                                id="toggle-disable-multihop-button"
                                isActive={singleHopOnly}
                                toggle={() => (singleHopOnly ? setSingleHopOnly(false) : setSingleHopOnly(true))}
                            />
                        </RowBetween>*/}
                    </AutoColumn>
                </ExtendedMenuFlyout>
            )}
        </StyledMenu>
    )
}
