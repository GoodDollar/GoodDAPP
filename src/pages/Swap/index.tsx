import React, { cloneElement, memo, useCallback, useEffect, useRef, useState } from 'react'
import { SwapCardSC, SwapContentWrapperSC, SwapWrapperSC } from './styled'
import Title from '../../components/gd/Title'
import SwapRow from './SwapRow'
import { ButtonAction } from '../../components/gd/Button'
import { SwitchSVG } from './common'
import SwapInfo from './SwapInfo'
import SwapDetails from './SwapDetails'
import SwapSettings from './SwapSettings'
import { SwapContext, SwapVariant, useTokens } from './hooks'
import { ETHER } from '@sushiswap/sdk'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useG$ from '../../hooks/useG$'
import useWeb3 from '../../hooks/useWeb3'
import { getMeta as getBuyMeta, getMetaReverse as getBuyMetaReverse } from '../../sdk/buy'
import { getMeta as getSellMeta, getMetaReverse as getSellMetaReverse } from '../../sdk/sell'
import { SupportedChainId } from '../../sdk/constants/chains'

function Swap() {
    const [buying, setBuying] = useState(true)
    const [slippageTolerance, setSlippageTolerance] = useState({
        custom: false,
        value: '0.1'
    })
    const [swapPair, setSwapPair] = useState<SwapVariant>({
        token: ETHER,
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
    const { account, chainId } = useActiveWeb3React()
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
        }, 400))
    }, [account, chainId, lastEdited, buying, web3, slippageTolerance.value])

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
                                    <ButtonAction className="flex-grow" style={{ marginTop: 22 }}>
                                        Approve
                                    </ButtonAction>
                                )}
                                <ButtonAction className="flex-grow" style={{ marginTop: 22 }} disabled>
                                    Swap
                                </ButtonAction>
                            </div>
                        )}
                    </SwapContentWrapperSC>
                </SwapWrapperSC>
                <SwapDetails open={Boolean(swapPair.value && swapValue)} />
            </SwapCardSC>
        </SwapContext.Provider>
    )
}

export default memo(Swap)
