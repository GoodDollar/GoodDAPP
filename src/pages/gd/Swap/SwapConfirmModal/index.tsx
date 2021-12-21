import React, { CSSProperties, memo, ReactNode, useEffect, useReducer, useState } from 'react'
import { SwapConfirmModalSC } from './styled'
import Modal from 'components/Modal'
import Title from 'components/gd/Title'
import { SwapDetailsFields } from '../SwapDetails'
import SwapInfo from '../SwapInfo'
import { ButtonAction, ButtonDefault } from 'components/gd/Button'
import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@sushiswap/sdk'
import { buy, BuyInfo } from 'sdk/buy'
import { sell, SellInfo } from 'sdk/sell'
import { addTransaction } from 'state/transactions/actions'
import { useDispatch } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useWeb3 from 'hooks/useWeb3'
import { Action } from 'pages/gd/Stake/StakeDeposit'
import { getExplorerLink } from 'utils'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface SwapConfirmModalProps extends SwapDetailsFields {
    className?: string
    style?: CSSProperties
    price?: string | null
    onConfirm?: () => any
    pair: [
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
    meta: BuyInfo | SellInfo | null | undefined
    buying: boolean
}

const initialState = {}

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
    buying,
    meta
}: SwapConfirmModalProps) {
    const { i18n } = useLingui()
    const [from, to] = pair ?? []
    const globalDispatch = useDispatch()
    const { chainId } = useActiveWeb3React()
    const web3 = useWeb3()
    const [status, setStatus] = useState<'PREVIEW' | 'CONFIRM' | 'SENT'>('SENT')
    const [hash, setHash] = useState('')

    const handleSwap = async () => {
        setStatus('CONFIRM')
        const onSent = (hash: string) => {
            setStatus('SENT')
            setHash(hash)
            if (onConfirm) onConfirm()
        }
        try {
            let transactionDetails = buying ? await buy(web3!, meta!, onSent) : await sell(web3!, meta!, onSent)
            globalDispatch(
                addTransaction({
                    chainId: chainId!,
                    hash: transactionDetails.transactionHash,
                    from: transactionDetails.from
                })
            )
        } catch (e) {
            console.error(e)
            setStatus('PREVIEW')
        }
    }

    useEffect(() => {
        if (open) {
            setStatus('PREVIEW')
            setHash('')
        }
    }, [open])

    let content: ReactNode

    switch (status) {
        case 'PREVIEW':
            content = (
                <>
                    <Title className="text-center mb-6">{i18n._(t`Confirm swap`)}</Title>
                    <div className="diagram mb-6">
                        <div className="icon">
                            <CurrencyLogo currency={from?.token} size={'54px'} />
                        </div>
                        <div className="value">{from?.value}</div>
                        <div className="symbol">{from?.token?.getSymbol()}</div>
                        <div className="direction">
                            <svg
                                width="36"
                                height="36"
                                viewBox="0 0 36 36"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
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
                        {i18n._(
                            t`Output is estimated. You will receive at least ${minimumReceived} or the transaction will revert`
                        )}
                    </div>
                    <div className="mt-8 mb-8">
                        <SwapInfo title="Price" value={price} />
                        <SwapInfo
                            title={i18n._(t`Minimum received`)}
                            value={minimumReceived}
                            tip={i18n._(
                                t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
                            )}
                        />
                        <SwapInfo
                            title={i18n._(t`Price Impact`)}
                            value={priceImpact}
                            tip={i18n._(
                                t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
                            )}
                        />
                        <SwapInfo
                            title={i18n._(t`Liquidity Provider Fee`)}
                            value={liquidityFee}
                            tip={i18n._(
                                t`A portion of each trade (0.25%) goes to liquidity providers as a protocol incentive.`
                            )}
                        />
                        <SwapInfo
                            title={i18n._(t`Route`)}
                            value={route}
                            tip={i18n._(t`Routing through these tokens resulted in the best price for your trade.`)}
                        />
                        {GDX && <SwapInfo title="GDX" value={GDX} />}
                        {exitContribution && exitContribution !== undefined && (
                            <SwapInfo title="EXIT CONTRIBUTION" value={exitContribution} />
                        )}
                    </div>
                    <ButtonAction onClick={handleSwap} disabled={false}>
                        {i18n._(t`CONFIRM SWAP`)}
                    </ButtonAction>
                </>
            )
            break
        case 'CONFIRM':
            content = (
                <>
                    <Title className="text-center mt-6 mb-6">{i18n._(t`Waiting for Confirmation`)}</Title>
                    <div className="text-center">
                        {i18n._(t`Swapping`)} {price}
                    </div>
                    <div className="description text-center">{i18n._(t`Confirm this transaction in your wallet`)}</div>
                </>
            )
            break
        case 'SENT':
            content = (
                <>
                    <Title className="text-center mb-6 mb-6">{i18n._(t`Transaction Submitted`)}</Title>
                    {chainId && (
                        <div className="text-center">
                            <a
                                className="text-cyan-blue hover:underline"
                                href={getExplorerLink(chainId, hash, 'transaction')}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {i18n._(t`View on explorer`)}
                            </a>
                        </div>
                    )}
                    <div className="flex justify-center mt-1">
                        <ButtonDefault width="auto" className="px-16" onClick={onClose}>
                            {i18n._(t`Close`)}
                        </ButtonDefault>
                    </div>
                </>
            )
            break
    }

    return (
        <Modal isOpen={open} showClose onDismiss={onClose}>
            <SwapConfirmModalSC className={className} style={style}>
                {content}
            </SwapConfirmModalSC>
        </Modal>
    )
}

export default memo(SwapConfirmModal)
