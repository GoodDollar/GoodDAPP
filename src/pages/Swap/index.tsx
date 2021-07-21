import React, { cloneElement, memo, useCallback, useState } from 'react'
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
    const handleSetSwapForm = useCallback(
        (value: Partial<SwapVariant>) =>
            setSwapPair(current => ({
                ...current,
                ...value
            })),
        []
    )
    const tokenList = useTokens()
    const G$ = useG$()
    const [swapValue, setSwapValue] = useState('')
    const { account } = useActiveWeb3React()
    const pairBalance = useCurrencyBalance(account ?? undefined, swapPair.token)
    const swapBalance = useCurrencyBalance(account ?? undefined, G$)

    return (
        <SwapContext.Provider
            value={{
                slippageTolerance,
                setSlippageTolerance,
                tokenList: tokenList ?? [],
                tokenListLoading: tokenList == null,
                swapPair,
                setSwapPair: handleSetSwapForm,
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
                            onValueChange={value => handleSetSwapForm({ value })}
                            onTokenChange={token => handleSetSwapForm({ token, value: '' })}
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
                            onValueChange={setSwapValue}
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
                        <ButtonAction style={{ marginTop: 22 }} disabled>
                            Enter amount
                        </ButtonAction>
                    </SwapContentWrapperSC>
                </SwapWrapperSC>
                <SwapDetails open={Boolean(swapPair.value && swapValue)} />
            </SwapCardSC>
        </SwapContext.Provider>
    )
}

export default memo(Swap)
