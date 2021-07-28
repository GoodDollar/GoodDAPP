import React, { cloneElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SwapCardSC, SwapContentWrapperSC, SwapWrapperSC } from './styled'
import Title from '../../components/gd/Title'
import SwapRow from './SwapRow'
import { ButtonAction } from '../../components/gd/Button'
import { SwitchSVG } from './common'
import SwapInfo from './SwapInfo'
import SwapDetails from './SwapDetails'
import SwapSettings from './SwapSettings'
import { SwapContext, SwapVariant, useTokens } from './hooks'
import { Currency, ETHER } from '@sushiswap/sdk'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useG$ from '../../hooks/useG$'
import useWeb3 from '../../hooks/useWeb3'
import {
    approve as approveBuy,
    buy,
    BuyInfo,
    getMeta as getBuyMeta,
    getMetaReverse as getBuyMetaReverse
} from '../../sdk/buy'
import {
    approve as approveSell,
    getMeta as getSellMeta,
    getMetaReverse as getSellMetaReverse,
    sell,
    SellInfo
} from '../../sdk/sell'
import { SupportedChainId } from '../../sdk/constants/chains'
import SwapConfirmModal from './SwapConfirmModal'
import { FUSE } from '../../constants'

function Swap() {
    const [buying, setBuying] = useState(true)
    const [slippageTolerance, setSlippageTolerance] = useState({
        custom: false,
        value: '0.1'
    })
    const { account, chainId } = useActiveWeb3React()
    const [swapPair, setSwapPair] = useState<SwapVariant>({
        token: SupportedChainId[Number(chainId)] === 'FUSE' ? FUSE : ETHER,
        value: ''
    })
    const handleSetPair = useCallback(
        (value: Partial<SwapVariant>) =>
            setSwapPair(current => ({
                ...current,
                ...value
            })),
        []
    )
    const handleSetPairValue = useCallback((value: string) => handleSetPair({ value }), [])

    const tokenList = useTokens()
    const G$ = useG$()
    const [swapValue, setSwapValue] = useState('')
    const [meta, setMeta] = useState<undefined | BuyInfo | SellInfo>()
    const pairBalance = useCurrencyBalance(account ?? undefined, swapPair.token)
    const swapBalance = useCurrencyBalance(account ?? undefined, G$)
    const web3 = useWeb3()
    const [lastEdited, setLastEdited] = useState<{ field: 'external' | 'internal' }>()

    const metaTimer = useRef<any>()
    useEffect(() => {
        clearTimeout(metaTimer.current)
        if (!account || !web3 || !SupportedChainId[Number(chainId)] || !lastEdited) return
        const { field } = lastEdited
        const getMeta = buying
            ? field === 'external'
                ? getBuyMeta
                : getBuyMetaReverse
            : field === 'internal'
            ? getSellMeta
            : getSellMetaReverse
        const value = field === 'external' ? swapPair.value : swapValue
        const symbol = swapPair.token.getSymbol()
        const setOtherValue = field === 'external' ? setSwapValue : handleSetPairValue

        if (!symbol) return
        if (!value.match(/[^0.]/)) {
            setOtherValue('')
            setMeta(undefined)
            return
        }

        const timer = (metaTimer.current = setTimeout(async () => {
            const meta = await getMeta(web3, symbol, value, parseFloat(slippageTolerance.value))
            if (!meta || metaTimer.current !== timer) return
            setOtherValue(
                buying
                    ? field === 'external'
                        ? meta.outputAmount.toFixed()
                        : meta.inputAmount.toFixed()
                    : field === 'external'
                    ? meta.inputAmount.toFixed()
                    : meta.outputAmount.toFixed()
            )
            setMeta(meta)
        }, 400))
    }, [account, chainId, lastEdited, buying, web3, slippageTolerance.value])
    const [swapping, setSwapping] = useState(false)
    const [approving, setApproving] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [approved, setApproved] = useState(false)
    const handleApprove = async () => {
        if (!meta || !web3) return
        try {
            setApproving(true)
            if (buying) {
                await approveBuy(web3, meta)
            } else {
                await approveSell(web3, meta)
            }
            setApproved(true)
        } finally {
            setApproving(false)
        }
    }
    useEffect(() => setApproved(false), [swapValue, swapPair, buying])

    const balanceNotEnough = useMemo(
        () =>
            BigInt(meta?.inputAmount.multiply(meta?.inputAmount.decimalScale).toFixed(0) ?? '0') >
            BigInt(pairBalance?.raw.toString() ?? '0'),
        [meta?.inputAmount, pairBalance]
    )

    const route = useMemo(() => {
        let route = meta?.route.map(token => token.symbol).join(' > ')

        if (!route) return route
        if (SupportedChainId[Number(chainId)] === 'FUSE') return route

        if (buying) {
            return route.endsWith('cDAI') ? `${route} > ${G$?.symbol}` : `${route} > cDAI > ${G$?.symbol}`
        } else {
            return route.startsWith('cDAI') ? `${G$?.symbol} > ${route}` : `${G$?.symbol} > cDAI > ${route}`
        }
    }, [meta?.route, buying, chainId])

    let inputSymbol
    let outputSymbol
    if (meta) {
        inputSymbol =
            SupportedChainId[Number(chainId)] === 'FUSE'
                ? meta.inputAmount.currency.symbol === 'WETH9'
                    ? 'FUSE'
                    : meta.inputAmount.currency.symbol
                : meta.inputAmount.currency.symbol === 'WETH9'
                ? 'ETH'
                : meta.inputAmount.currency.symbol
        outputSymbol =
            SupportedChainId[Number(chainId)] === 'FUSE'
                ? meta.outputAmount.currency.symbol === 'WETH9'
                    ? 'FUSE'
                    : meta.outputAmount.currency.symbol
                : meta.outputAmount.currency.symbol === 'WETH9'
                ? 'ETH'
                : meta.outputAmount.currency.symbol
    }

    const swapFields = {
        minimumReceived:
            meta && `${meta.minimumOutputAmount.toSignificant(4)} ${meta.minimumOutputAmount.currency.symbol}`,
        priceImpact: meta && `${meta.priceImpact.toFixed(2)}%`,
        liquidityFee: meta && `${meta.liquidityFee.toSignificant(6)} ${swapPair.token.getSymbol()}`,
        route: route,
        GDX: meta?.GDXAmount.toFixed(2),
        exitContribution: (meta as SellInfo)?.contribution?.toSignificant(6),
        price:
            meta &&
            `${
                buying
                    ? meta.inputAmount
                          .divide(meta.outputAmount.asFraction)
                          .multiply(meta.outputAmount.decimalScale)
                          .toSignificant(6)
                    : meta.outputAmount
                          .multiply(meta.inputAmount.decimalScale)
                          .divide(meta.inputAmount.asFraction)
                          .toSignificant(6)
            } ${inputSymbol} PER ${outputSymbol} `
    }

    const pair: [
        {
            value?: string
            token?: Currency
        },
        {
            value?: string
            token?: Currency
        }
    ] = [
        {
            token: swapPair.token,
            value: swapPair.value
        },
        {
            token: G$,
            value: swapValue
        }
    ]

    if (!buying) pair.reverse()

    return (
        <SwapContext.Provider
            value={{
                slippageTolerance,
                setSlippageTolerance,
                tokenList: tokenList ?? [],
                tokenListLoading: tokenList == null,
                swapPair,
                setSwapPair: handleSetPair,
                buying,
                setBuying
            }}
        >
            <SwapCardSC>
                <SwapWrapperSC>
                    <div className="flex justify-between items-center">
                        <Title>Swap</Title>
                        <SwapSettings />
                    </div>
                    <SwapContentWrapperSC>
                        <SwapRow
                            title={buying ? 'Swap from' : 'Swap to'}
                            select
                            autoMax
                            balance={pairBalance?.toSignificant(4) ?? 0}
                            style={{ marginBottom: buying ? 13 : 0, marginTop: buying ? 0 : 13, order: buying ? 1 : 3 }}
                            token={swapPair.token}
                            value={swapPair.value}
                            onValueChange={value => {
                                handleSetPairValue(value)
                                setLastEdited({ field: 'external' })
                            }}
                            onTokenChange={token => {
                                handleSetPair({ token, value: '' })
                                setSwapValue('')
                                setMeta(undefined)
                            }}
                            tokenList={tokenList ?? []}
                        />
                        <div className="switch">
                            {cloneElement(SwitchSVG, {
                                onClick: () => setBuying(value => !value)
                            })}
                        </div>
                        <SwapRow
                            title={buying ? 'Swap to' : 'Swap from'}
                            select={false}
                            balance={swapBalance?.toSignificant(4) ?? 0}
                            token={G$}
                            alternativeSymbol="G$"
                            value={swapValue}
                            onValueChange={value => {
                                setSwapValue(value)
                                setLastEdited({ field: 'internal' })
                            }}
                            style={{ marginTop: buying ? 13 : 0, marginBottom: buying ? 0 : 13, order: buying ? 3 : 1 }}
                        />
                        <div style={{ marginTop: 14, padding: '0 4px' }}>
                            <SwapInfo
                                title="Slippage Tolerance"
                                value={`${slippageTolerance.value || '0'}${
                                    slippageTolerance.value.endsWith('%') ? '' : '%'
                                }`}
                            />
                            {meta && <SwapInfo title="Price" value={swapFields.price} />}
                        </div>
                        {!account ? (
                            <ButtonAction style={{ marginTop: 22 }} disabled>
                                Connect wallet
                            </ButtonAction>
                        ) : !(swapPair.value || swapValue) ? (
                            <ButtonAction style={{ marginTop: 22 }} disabled>
                                Enter amount
                            </ButtonAction>
                        ) : (
                            <div className={swapPair.token === ETHER ? 'flex' : 'flex space-x-4'}>
                                {swapPair.token !== ETHER && (
                                    <ButtonAction
                                        className="flex-grow"
                                        style={{ marginTop: 22 }}
                                        onClick={handleApprove}
                                        disabled={!meta || approved || approving || balanceNotEnough}
                                    >
                                        {approving ? 'Approving' : approved ? 'Approved' : 'Approve'}
                                    </ButtonAction>
                                )}
                                <ButtonAction
                                    className="flex-grow"
                                    style={{ marginTop: 22 }}
                                    disabled={
                                        !meta || balanceNotEnough || (swapPair.token === ETHER ? false : !approved)
                                    }
                                    onClick={() => setShowConfirm(true)}
                                >
                                    Swap
                                </ButtonAction>
                            </div>
                        )}
                    </SwapContentWrapperSC>
                </SwapWrapperSC>
                <SwapDetails open={Boolean(meta)} {...swapFields} />
            </SwapCardSC>
            <SwapConfirmModal
                {...swapFields}
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                pair={pair}
                swapping={swapping}
                onConfirm={async () => {
                    try {
                        setSwapping(true)
                        if (buying) {
                            await buy(web3!, meta!)
                        } else {
                            await sell(web3!, meta!)
                        }
                        handleSetPairValue('')
                        setSwapValue('')
                        setShowConfirm(false)
                    } finally {
                        setSwapping(false)
                    }
                }}
            />
        </SwapContext.Provider>
    )
}

export default memo(Swap)
