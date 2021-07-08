import React from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
    padding-top: calc(16px + 2rem);
    padding-bottom: 16px;
    margin-top: -2rem;
    width: 100%;
    max-width: 694px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    background-color: ${({ theme }) => theme.color.bg1};
    padding-right: 10px;
    padding-left: 10px;

    transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
    transition: transform 300ms ease-in-out;
    box-shadow: ${({ theme }) => theme.shadow.swapFooter};

    font-weight: bold;
    font-size: 14px;
    line-height: 166%;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.text5};
`

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
    const lastTrade = useLastTruthy(trade)
    return (
        <AdvancedDetailsFooter show={Boolean(trade)}>
            <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
        </AdvancedDetailsFooter>
    )
}
