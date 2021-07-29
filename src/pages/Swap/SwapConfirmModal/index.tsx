import React, { CSSProperties, memo } from 'react'
import { SwapConfirmModalSC } from './styled'
import Modal from '../../../components/Modal'
import Title from '../../../components/gd/Title'
import { SwapDetailsFields } from '../SwapDetails'
import SwapInfo from '../SwapInfo'
import { ButtonAction } from '../../../components/gd/Button'
import CurrencyLogo from '../../../components/CurrencyLogo'
import { Currency } from '@sushiswap/sdk'

export interface SwapConfirmModalProps extends SwapDetailsFields {
    className?: string
    style?: CSSProperties
    price?: string | null
    onConfirm?: () => any
    pair?: [
        {
            value?: string
            token?: Currency
        },
        {
            value?: string
            token?: Currency
        }
    ]
    open: boolean
    onClose: () => any
    swapping?: boolean
}

function SwapConfirmModal({
    className,
    style,
    minimumReceived,
    priceImpact,
    liquidityFee,
    route,
    GDX,
    exitContribution,
    price,
    onConfirm,
    pair,
    open,
    onClose,
    swapping
}: SwapConfirmModalProps) {
    const [from, to] = pair ?? []
    return (
        <Modal isOpen={open} showClose onDismiss={onClose}>
            <SwapConfirmModalSC className={className} style={style}>
                <Title className="text-center mb-6">Confirm swap</Title>
                <div className="diagram mb-6">
                    <div className="icon">
                        <CurrencyLogo currency={from?.token} size={'54px'} />
                    </div>
                    <div className="value">{from?.value}</div>
                    <div className="symbol">{from?.token?.getSymbol()}</div>
                    <div className="direction">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect
                                x="1"
                                y="1"
                                width="34"
                                height="34"
                                rx="17"
                                fill="#1FC2AF"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <path
                                d="M26 18L24.59 16.59L19 22.17V10H17V22.17L11.42 16.58L10 18L18 26L26 18Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <div className="icon">
                        <CurrencyLogo currency={to?.token} size={'54px'} />
                    </div>
                    <div className="value">{to?.value}</div>
                    <div className="symbol">{to?.token?.getSymbol()}</div>
                </div>
                <div className="description">
                    Output is estimated. You will receive at least {minimumReceived} or the transaction will revert
                </div>
                <div className="mt-8 mb-8">
                    <SwapInfo title="Price" value={price} />
                    <SwapInfo
                        title="Minimum received"
                        value={minimumReceived}
                        tip="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
                    />
                    <SwapInfo
                        title="Price Impact"
                        value={priceImpact}
                        tip="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
                    />
                    <SwapInfo
                        title="Liquidity Provider Fee"
                        value={liquidityFee}
                        tip="A portion of each trade (0.25%) goes to liquidity providers as a protocol incentive."
                    />
                    <SwapInfo
                        title="Route"
                        value={route}
                        tip="Routing through these tokens resulted in the best price for your trade."
                    />
                    <SwapInfo title="GDX" value={GDX} />
                    {exitContribution && <SwapInfo title="EXIT CONTRIBUTION" value={exitContribution} />}
                </div>
                <ButtonAction onClick={onConfirm} disabled={swapping}>
                    {swapping ? 'SWAPPING' : 'CONFIRM SWAP'}
                </ButtonAction>
            </SwapConfirmModalSC>
        </Modal>
    )
}

export default memo(SwapConfirmModal)
