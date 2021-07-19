import React, { memo } from 'react'
import { SwapCardSC, SwapContentWrapperSC, SwapWrapperSC } from './styled'
import Title from '../../components/gd/Title'
import SwapRow from './SwapRow'
import { ButtonAction } from '../../components/gd/Button'
import { SwitchSVG } from './common'
import SwapInfo from './SwapInfo'
import SwapDetails from './SwapDetails'
import SwapSettings from './SwapSettings'

function Swap() {
    return (
        <SwapCardSC>
            <SwapWrapperSC>
                <div className="flex justify-between items-center">
                    <Title>Swap</Title>
                    <SwapSettings />
                </div>
                <SwapContentWrapperSC>
                    <SwapRow title="Swap from" select autoMax balance={0} style={{ marginBottom: 13 }} />
                    <div className="switch">
                        <SwitchSVG />
                    </div>
                    <SwapRow title="Swap to" select={false} balance={0} style={{ marginTop: 13 }} />
                    <div style={{ marginTop: 14, padding: '0 4px' }}>
                        <SwapInfo title="Slippage Tolerance" value="0.1%" />
                    </div>
                    <ButtonAction style={{ marginTop: 22 }} disabled>
                        Enter amount
                    </ButtonAction>
                </SwapContentWrapperSC>
            </SwapWrapperSC>
            <SwapDetails />
        </SwapCardSC>
    )
}

export default memo(Swap)
