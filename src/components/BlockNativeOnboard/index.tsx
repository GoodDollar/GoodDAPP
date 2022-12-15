import React from 'react'
import styled from 'styled-components'
import { useConnectWallet } from '@web3-onboard/react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const OnboardButton = styled.button`
    ${({ theme }) => theme.flexRowNoWrap}
    background-color: ${({ theme }) => theme.color.text2};
    border: none;
    border-radius: 6px;

    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: ${({ theme }) => theme.color.main};
    padding-left: 17px;
    padding-right: 17px;
    padding-top: 10px;
    height: 42px;
    transition: background 0.25s;

    &:hover,
    &:focus {
        border: none;
        background-color: ${({ theme }) => theme.color.text2hover};
        transition: background 0.25s;
    }
`

/**
 * Just a button to trigger the onboard connect modal.
 * any state updates after succesfully connecting are handled by useOnboardConnect (src/hooks/useActiveOnboard)
 * @returns Connect Button or Empty
 */

export function OnboardConnectButton(): JSX.Element {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
    const { i18n } = useLingui()
    if (wallet) {
        return <></>
    }

    return <OnboardButton onClick={() => connect()}>{i18n._(t`Connect to a wallet`)}</OnboardButton>
}
