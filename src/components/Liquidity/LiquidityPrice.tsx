import React from 'react'
import { Currency, Price } from '@sushiswap/sdk'
import { AutoRow } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function LiquidityPrice({
    input,
    output,
    price,
}: {
    input?: Currency
    output?: Currency
    price?: Price
}): JSX.Element {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    return (
        <div className="rounded-b-md p-1" style={{ marginTop: '-20px' }}>
            <AutoRow justify={'space-between'} style={{ padding: '0 1rem' }} className="rounded-b-md  py-1">
                <div>{i18n._(t`Current Rate`)}</div>
                <div>
                    {price?.toSignificant(6) ?? '-'} {output?.getSymbol(chainId)} per {input?.getSymbol(chainId)}
                </div>
            </AutoRow>
        </div>
    )
}
