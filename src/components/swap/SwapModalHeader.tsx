import { Trade, TradeType } from '@sushiswap/sdk'
import React, { useContext, useMemo } from 'react'
import { AlertTriangle, ArrowDown } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { ButtonPrimary } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { SwapShowAcceptChanges, TruncatedText } from './styleds'
import { t, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ButtonAction } from '../gd/Button'

const Wrapper = styled(AutoColumn)`
    .details {
        margin-bottom: 16px;

        * {
            font-style: italic;
            font-weight: normal;
            font-size: 14px;
            line-height: 16px;
            color: ${({ theme }) => theme.color.text4};
        }
    }
`

export default function SwapModalHeader({
    trade,
    allowedSlippage,
    recipient,
    showAcceptChanges,
    onAcceptChanges
}: {
    trade: Trade
    allowedSlippage: number
    recipient: string | null
    showAcceptChanges: boolean
    onAcceptChanges: () => void
}) {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
        trade,
        allowedSlippage
    ])
    const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    const theme = useTheme()

    return (
        <Wrapper gap={'md'} style={{ marginTop: '20px' }}>
            <RowBetween align="center">
                <RowFixed gap={'0px'}>
                    <CurrencyLogo currency={trade.inputAmount.currency} size={'54px'} style={{ marginRight: '12px' }} />
                    <TruncatedText
                        fontSize={24}
                        fontWeight={400}
                        color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : ''}
                    >
                        {trade.inputAmount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap={'0px'}>
                    <Text fontSize={24} fontWeight={700} style={{ marginLeft: '10px' }}>
                        {trade.inputAmount.currency.getSymbol(chainId)}
                    </Text>
                </RowFixed>
            </RowBetween>
            <RowFixed style={{ marginLeft: 9 }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="34" height="34" rx="17" fill="#1FC2AF" stroke="white" strokeWidth="2" />
                    <path d="M26 18L24.59 16.59L19 22.17V10H17V22.17L11.42 16.58L10 18L18 26L26 18Z" fill="white" />
                </svg>
            </RowFixed>
            <RowBetween align="center">
                <RowFixed gap={'0px'}>
                    <CurrencyLogo
                        currency={trade.outputAmount.currency}
                        size={'54px'}
                        style={{ marginRight: '12px' }}
                    />
                    <TruncatedText
                        fontSize={24}
                        fontWeight={400}
                        color={
                            priceImpactSeverity > 2
                                ? theme.red1
                                : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                                    ? theme.primary1
                                    : ''
                        }
                    >
                        {trade.outputAmount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap={'0px'}>
                    <Text fontSize={24} fontWeight={700} style={{ marginLeft: '10px' }}>
                        {trade.outputAmount.currency.getSymbol(chainId)}
                    </Text>
                </RowFixed>
            </RowBetween>
            {showAcceptChanges ? (
                <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
                    <RowBetween>
                        <RowFixed>
                            <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
                            <TYPE.main color={theme.primary1}> {i18n._(t`Price Updated`)}</TYPE.main>
                        </RowFixed>
                        <ButtonAction
                            size="sm"
                            width="fit-content"
                            style={{
                                padding: '.5rem',
                                fontSize: '0.825rem',
                                borderRadius: '12px'
                            }}
                            onClick={onAcceptChanges}
                        >
                            {i18n._(t`Accept`)}
                        </ButtonAction>
                    </RowBetween>
                </SwapShowAcceptChanges>
            ) : null}
            <div className="details">
                <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
                    {trade.tradeType === TradeType.EXACT_INPUT ? (
                        <TYPE.italic textAlign="left" style={{ width: '100%' }}>
                            <Trans>
                                {i18n._(t`Output is estimated. You will receive at least`)}{' '}
                                <b>
                                    {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)}{' '}
                                    {trade.outputAmount.currency.getSymbol(chainId)}
                                </b>{' '}
                                {i18n._(t`or the transaction will revert.`)}
                            </Trans>
                        </TYPE.italic>
                    ) : (
                        <TYPE.italic textAlign="left" style={{ width: '100%' }}>
                            <Trans>
                                {i18n._(t`Input is estimated. You will sell at most`)}{' '}
                                <b>
                                    {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)}{' '}
                                    {trade.inputAmount.currency.getSymbol(chainId)}
                                </b>{' '}
                                {i18n._(t`or the transaction will revert.`)}
                            </Trans>
                        </TYPE.italic>
                    )}
                </AutoColumn>
                {recipient !== null ? (
                    <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
                        <TYPE.main>
                            <Trans>
                                {i18n._(t`Output will be sent to`)}{' '}
                                <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
                            </Trans>
                        </TYPE.main>
                    </AutoColumn>
                ) : null}
            </div>
        </Wrapper>
    )
}
