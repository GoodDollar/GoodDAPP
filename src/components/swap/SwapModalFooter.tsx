import { Trade, TradeType } from '@sushiswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import {
    computeSlippageAdjustedAmounts,
    computeTradePriceBreakdown,
    formatExecutionPrice,
    warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ButtonAction } from '../gd/Button'

const SwapModalFooterWrapper = styled.div`
    div {
    }
`

export default function SwapModalFooter({
    trade,
    onConfirm,
    allowedSlippage,
    swapErrorMessage,
    disabledConfirm
}: {
    trade: Trade
    allowedSlippage: number
    onConfirm: () => void
    swapErrorMessage: string | undefined
    disabledConfirm: boolean
}) {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const [showInverted, setShowInverted] = useState<boolean>(false)
    const theme = useTheme()
    const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
        allowedSlippage,
        trade
    ])
    const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
    const severity = warningSeverity(priceImpactWithoutFee)

    return (
        <SwapModalFooterWrapper>
            <AutoColumn className="mb-1" gap="0px">
                <RowBetween align="center">
                    <Text fontWeight={700} fontSize={14} color={theme.color.text5}>
                        {i18n._(t`Price`)}
                    </Text>
                    <Text
                        fontSize={14}
                        fontWeight={500}
                        color={theme.color.text5}
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            textAlign: 'right',
                            paddingLeft: '10px'
                        }}
                    >
                        {formatExecutionPrice(trade, showInverted, chainId)}
                        <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="8.5" cy="8.5" r="8.5" fill="#1A1F38" />
                                <path
                                    d="M4.95125 7.79163L2.125 10.625L4.95125 13.4583V11.3333H9.91667V9.91663H4.95125V7.79163ZM14.875 6.37496L12.0487 3.54163V5.66663H7.08333V7.08329H12.0487V9.20829L14.875 6.37496Z"
                                    fill="white"
                                />
                            </svg>
                        </StyledBalanceMaxMini>
                    </Text>
                </RowBetween>

                <RowBetween>
                    <RowFixed>
                        <TYPE.black fontSize={14} fontWeight={700} color={theme.color.text5}>
                            {trade.tradeType === TradeType.EXACT_INPUT
                                ? i18n._(t`Minimum received`)
                                : i18n._(t`Maximum sold`)}
                        </TYPE.black>
                        <QuestionHelper
                            text={i18n._(
                                t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
                            )}
                        />
                    </RowFixed>
                    <RowFixed>
                        <TYPE.black fontSize={14} fontWeight={500} color={theme.color.text5}>
                            {trade.tradeType === TradeType.EXACT_INPUT
                                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
                        </TYPE.black>
                        <TYPE.black fontSize={14} marginLeft={'4px'} fontWeight={500} color={theme.color.text5}>
                            {trade.tradeType === TradeType.EXACT_INPUT
                                ? trade.outputAmount.currency.getSymbol(chainId)
                                : trade.inputAmount.currency.getSymbol(chainId)}
                        </TYPE.black>
                    </RowFixed>
                </RowBetween>
                <RowBetween>
                    <RowFixed>
                        <TYPE.black color={theme.color.text5} fontSize={14} fontWeight={700}>
                            {i18n._(t`Price Impact`)}
                        </TYPE.black>
                        <QuestionHelper
                            text={i18n._(t`The difference between the market price and your price due to trade size.`)}
                        />
                    </RowFixed>
                    <TYPE.black fontSize={14} fontWeight={500} color={theme.color.text5}>
                        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
                    </TYPE.black>
                </RowBetween>
                <RowBetween>
                    <RowFixed>
                        <TYPE.black fontSize={14} fontWeight={700} color={theme.color.text5}>
                            {i18n._(t`Liquidity Provider Fee`)}
                        </TYPE.black>
                        <QuestionHelper
                            text={i18n._(
                                t`Swapping G$ against GoodReserve has no third party fees if you swap from/to cDAI as it's our reserve token. Swapping G$s from/to other assets implies a 0.3% of fee going to 3rd party AMM liquidity providers.`
                            )}
                        />
                    </RowFixed>
                    <TYPE.black fontSize={14} fontWeight={500} color={theme.color.text5}>
                        {realizedLPFee
                            ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.getSymbol(chainId)
                            : '-'}
                    </TYPE.black>
                </RowBetween>
            </AutoColumn>

            <AutoRow>
                <ButtonAction
                    onClick={onConfirm}
                    disabled={disabledConfirm}
                    error={severity > 2}
                    style={{ margin: '10px 0 0 0' }}
                    id="confirm-swap-or-send"
                >
                    <Text fontSize={20} fontWeight={500} style={{ textTransform: 'uppercase' }}>
                        {severity > 2 ? i18n._(t`Swap Anyway`) : i18n._(t`Confirm Swap`)}
                    </Text>
                </ButtonAction>

                {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </AutoRow>
        </SwapModalFooterWrapper>
    )
}
