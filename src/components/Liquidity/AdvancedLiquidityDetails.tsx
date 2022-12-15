import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

function TradeSummary() {
    const { i18n } = useLingui()

    return (
        <>
            <AutoColumn style={{ padding: '0 16px' }} className="">
                <RowBetween>
                    <RowFixed>
                        <div className="">{i18n._(t`Your Pool Tokens`)}</div>
                    </RowFixed>
                    <RowFixed>
                        <div className="white">
                            1.576 →&nbsp;
                            <span className="green">1.787 ETH/SUSHI SLP</span>
                        </div>
                    </RowFixed>
                </RowBetween>
                <RowBetween>
                    <RowFixed>
                        <div className="">{i18n._(t`Your Pool Share`)}</div>
                    </RowFixed>
                    <RowFixed>
                        <div className="white">
                            &lt; 0.01% →&nbsp;
                            <span className="green">0.01%</span>
                        </div>
                    </RowFixed>
                </RowBetween>
                <RowBetween>
                    <RowFixed>
                        <div className="">{i18n._(t`Liquidity Provider Fee`)}</div>
                    </RowFixed>
                    <RowFixed>
                        <div className="white">0.00283 ETH</div>
                    </RowFixed>
                </RowBetween>
                <RowBetween>
                    <RowFixed>
                        <div className="">{i18n._(t`Network Fee`)}</div>
                    </RowFixed>
                    <RowFixed>
                        <div className="white">0.008654 ETH</div>
                    </RowFixed>
                </RowBetween>
            </AutoColumn>
        </>
    )
}

export interface AdvancedLiquidityDetailsProps {
    show?: boolean
}

export function AdvancedLiquidityDetails() {
    return (
        <AutoColumn gap="0px">
            <TradeSummary />
        </AutoColumn>
    )
}
