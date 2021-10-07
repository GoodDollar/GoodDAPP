import React, { memo, useCallback, useState } from 'react'
import { ButtonDefault } from 'components/gd/Button'
import Withdraw from 'components/Withdraw'
import { MyStake } from '../../sdk/staking'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface PortfolioTableRowProps {
    stake: MyStake
    onWithdraw: () => void
}

function PortfolioTableRow({ stake, onWithdraw }: PortfolioTableRowProps) {
    const { i18n } = useLingui()
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)
    const handleWithdrawOpen = useCallback(() => setWithdrawOpen(true), [])

    return (
        <>
            <tr>
                <td>UBI</td>
                <td>
                    {stake.tokens.A.symbol} / {stake.tokens.B.symbol}
                    <Withdraw
                        open={isWithdrawOpen}
                        setOpen={setWithdrawOpen}
                        token={`${stake.tokens.A.symbol}`}
                        totalStake={parseFloat(stake.stake.amount.toFixed(undefined, { groupSeparator: ',' }))}
                        protocol={'compound'}
                        onWithdraw={onWithdraw}
                        stake={stake}
                    />
                </td>
                <td>{stake.protocol}</td>
                <td>
                    <span className="whitespace-nowrap">
                        {stake.stake.amount.toSignificant(6, { groupSeparator: ',' })}{' '}
                        {stake.stake.amount.currency.symbol}
                    </span>{' '}
                    <br />~{stake.stake.amount$.toFixed(2, { groupSeparator: ',' })}$
                </td>
                <td className="whitespace-nowrap">
                    {stake.rewards.reward.claimed
                        .add(stake.rewards.reward.unclaimed)
                        .toSignificant(6, { groupSeparator: ',' })}{' '}
                    {stake.rewards.reward.claimed.currency.symbol} <br />~
                    {stake.rewards.reward$.claimed
                        .add(stake.rewards.reward$.unclaimed)
                        .toFixed(2, { groupSeparator: ',' })}
                    $
                </td>
                <td className="whitespace-nowrap">
                    {stake.multiplier ? (
                        <>{i18n._(t`This month`)} 1.0X</>
                    ) : (
                        <>
                            {i18n._(t`This month`)} 0.5X
                            <br />
                            {i18n._(t`Next month:`)} 1.0X
                        </>
                    )}
                </td>
                <td>
                    {stake.rewards.GDAO.claimed
                        .add(stake.rewards.GDAO.unclaimed)
                        .toSignificant(6, { groupSeparator: ',' })}{' '}
                    {stake.rewards.GDAO.claimed.currency.symbol}
                </td>
                <td>
                    <div className="flex justify-end">
                        <ButtonDefault size="sm" width="99px" onClick={handleWithdrawOpen}>
                            {i18n._(t`Withdraw`)}
                        </ButtonDefault>
                    </div>
                </td>
            </tr>
            <tr className="mobile">
                <td colSpan={8}>
                    <ButtonDefault size="sm" width="99px" onClick={handleWithdrawOpen}>
                        {i18n._(t`Withdraw`)}
                    </ButtonDefault>
                </td>
            </tr>
        </>
    )
}

export default memo(PortfolioTableRow)
