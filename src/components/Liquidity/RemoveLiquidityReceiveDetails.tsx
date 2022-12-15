import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, currencyEquals, ETHER, WETH } from '@sushiswap/sdk'
import { AutoColumn } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { RowBetween } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { StyledInternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'

interface RemoveLiquidityReceiveDetailsProps {
    currencyA?: Currency
    amountA: string
    currencyB?: Currency
    amountB: string
    hasWETH: boolean
    hasETH: boolean
    id: string
}

export default function RemoveLiquidityReceiveDetails({
    currencyA,
    amountA,
    currencyB,
    amountB,
    hasWETH,
    hasETH,
    id,
}: RemoveLiquidityReceiveDetailsProps) {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    if (!chainId || !currencyA || !currencyB) throw new Error('missing dependencies')
    return (
        <div id={id} className="p-5 rounded">
            <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
                <div className="w-full sm:w-2/5 white" style={{ margin: 'auto 0px' }}>
                    <AutoColumn>
                        <div>{i18n._(t`You Will Receive:`)}</div>
                        <RowBetween className="">
                            {hasWETH ? (
                                <StyledInternalLink
                                    to={`/remove/${
                                        currencyA === ETHER ? WETH[chainId].address : currencyId(currencyA)
                                    }/${currencyB === ETHER ? WETH[chainId].address : currencyId(currencyB)}`}
                                >
                                    Receive W{Currency.getNativeCurrencySymbol(chainId)}
                                </StyledInternalLink>
                            ) : hasETH ? (
                                <StyledInternalLink
                                    to={`/remove/${
                                        currencyA && currencyEquals(currencyA, WETH[chainId])
                                            ? 'ETH'
                                            : currencyId(currencyA)
                                    }/${
                                        currencyB && currencyEquals(currencyB, WETH[chainId])
                                            ? 'ETH'
                                            : currencyId(currencyB)
                                    }`}
                                >
                                    Receive {Currency.getNativeCurrencySymbol(chainId)}
                                </StyledInternalLink>
                            ) : null}
                        </RowBetween>
                    </AutoColumn>
                </div>
                {/* <RowBetween className="space-x-6"> */}
                <div className="flex flex-col space-y-3 md:flex-row md:space-x-6 md:space-y-0">
                    <div className="flex flex-row items-center w-full p-3 rounded">
                        <CurrencyLogo currency={currencyA} size="46px" style={{ marginRight: '12px' }} />
                        <AutoColumn>
                            <div className="white">{amountA}</div>
                            <div className="">{currencyA?.getSymbol(chainId)}</div>
                        </AutoColumn>
                    </div>
                    <div className="flex flex-row items-center w-full p-3 rounded">
                        <CurrencyLogo currency={currencyB} size="46px" style={{ marginRight: '12px' }} />
                        <AutoColumn>
                            <div className="white">{amountB}</div>
                            <div className="">{currencyB?.getSymbol(chainId)}</div>
                        </AutoColumn>
                    </div>
                </div>
                {/* </RowBetween> */}
            </div>
        </div>
    )
}
