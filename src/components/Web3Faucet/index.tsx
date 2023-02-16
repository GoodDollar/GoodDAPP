import React from 'react'
import { ButtonDefault } from '../gd/Button'
import { MouseoverTooltip } from '../Tooltip'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

import { useClaiming } from 'hooks/useClaiming'

const ClaimButton = styled(ButtonDefault).attrs((props) => ({
    disabled: false as boolean,
    likeDisabled: props.disabled,
}))`
    ${({ likeDisabled }) =>
        likeDisabled
            ? `
        opacity: 0.5;
        cursor: auto;
  `
            : ''}

    @media ${({ theme }) => theme.media.md} {
        height: 36px;
        font-size: 14px;

        svg {
            display: none;
        }
    }
`

function Web3Faucet(): JSX.Element | null {
    const { i18n } = useLingui()
    const { claimed, isFuse, claimActive, claimable, tillClaim, handleClaim } = useClaiming()

    return (
        <div className="flex flex-row px-2 space-x-2 cursor-pointer">
            <MouseoverTooltip
                placement="bottom"
                text={
                    isFuse === false
                        ? i18n._(t`Please connect your Web3 wallet to the Fuse Network to Claim UBI.`)
                        : claimed
                        ? i18n._(t`You've already claimed today. Come back in ${tillClaim}`)
                        : claimable instanceof Error
                        ? claimable.message
                        : i18n._(t`Click this button to Claim your Daily UBI in `) + ' G$'
                }
                offset={[0, 12]}
            >
                <ClaimButton
                    className="px-5 cursor-pointer"
                    borderRadius="12px"
                    disabled={!claimActive}
                    onClick={claimActive ? handleClaim : undefined}
                >
                    <div className="flex items-center">
                        <span>{i18n._(t`Claim UBI`)}</span>
                        <svg
                            className="ml-2"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M9.16675 14.9998H10.8334V13.3332H9.16675V14.9998ZM10.0001 1.6665C5.40008 1.6665 1.66675 5.39984 1.66675 9.99984C1.66675 14.5998 5.40008 18.3332 10.0001 18.3332C14.6001 18.3332 18.3334 14.5998 18.3334 9.99984C18.3334 5.39984 14.6001 1.6665 10.0001 1.6665ZM10.0001 16.6665C6.32508 16.6665 3.33341 13.6748 3.33341 9.99984C3.33341 6.32484 6.32508 3.33317 10.0001 3.33317C13.6751 3.33317 16.6667 6.32484 16.6667 9.99984C16.6667 13.6748 13.6751 16.6665 10.0001 16.6665ZM10.0001 4.99984C8.15841 4.99984 6.66675 6.4915 6.66675 8.33317H8.33342C8.33342 7.4165 9.08342 6.6665 10.0001 6.6665C10.9167 6.6665 11.6667 7.4165 11.6667 8.33317C11.6667 9.99984 9.16675 9.7915 9.16675 12.4998H10.8334C10.8334 10.6248 13.3334 10.4165 13.3334 8.33317C13.3334 6.4915 11.8417 4.99984 10.0001 4.99984Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                </ClaimButton>
            </MouseoverTooltip>
        </div>
    )
}

export default Web3Faucet
