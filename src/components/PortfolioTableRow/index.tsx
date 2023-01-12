import React, { memo, useCallback, useState } from 'react'
import Withdraw from 'components/Withdraw'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ButtonAction } from 'components/gd/Button'
import ClaimRewards from 'components/ClaimRewards'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'

import { MyStake, LIQUIDITY_PROTOCOL, SupportedChainId } from '@gooddollar/web3sdk'
import { SupportedChains } from '@gooddollar/web3sdk-v2'

interface PortfolioTableRowProps {
    stake: MyStake
    onUpdate: () => void
}

const PortfolioTableRow = memo(({ stake, onUpdate }: PortfolioTableRowProps) => {
    const { i18n } = useLingui()
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)
    const [isClaimRewardsOpen, setClaimRewardsOpen] = useState(false)
    const handleClaimRewardsOpen = useCallback(() => setClaimRewardsOpen(true), [])
    const { chainId } = useActiveWeb3React()

    const requireChain = stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? 'FUSE' : 'MAINNET'
    const claimableStake =
        (chainId === (SupportedChains.FUSE as number) && requireChain === 'FUSE') ||
        (chainId !== (SupportedChains.FUSE as number) && requireChain === 'MAINNET')
    const sendData = useSendAnalyticsData()

    const network = stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? SupportedChainId[chainId] : 'mainnet'
    const handleWithdrawOpen = useCallback(() => {
        sendData({ event: 'stake', action: 'savings_withdraw_rewards_claim_start', network })
        setWithdrawOpen(true)
    }, [sendData, network])

    return (
        <>
            <Withdraw
                open={isWithdrawOpen}
                setOpen={setWithdrawOpen}
                token={`${stake.tokens.A.symbol}`}
                protocol={stake.protocol}
                onWithdraw={onUpdate}
                stake={stake}
            />
            <ClaimRewards
                open={isClaimRewardsOpen}
                setOpen={setClaimRewardsOpen}
                protocol={stake.protocol}
                onClaim={onUpdate}
                stake={stake}
            />
            <tr>
                <td>
                    {stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO
                        ? !stake.isDeprecated
                            ? 'Governance'
                            : 'Governance (Deprecated)'
                        : !stake.isDeprecated
                        ? 'UBI'
                        : 'UBI (Deprecated)'}
                </td>
                <td>
                    {stake.tokens.A.symbol}
                    {stake.tokens.A.address !== stake.tokens.B.address ?? `/ ${stake.tokens.B.symbol}`}
                </td>
                <td>{stake.protocol}</td>
                <td>
                    <span className="whitespace-nowrap">
                        {stake.stake.amount.toSignificant(6, { groupSeparator: ',' })}{' '}
                        {stake.stake.amount.currency.symbol}
                    </span>{' '}
                    <br />~{stake.stake.amount$.toFixed(2, { groupSeparator: ',' })}$
                </td>
                {stake.protocol !== LIQUIDITY_PROTOCOL.GOODDAO ? (
                    <td className="whitespace-nowrap">
                        {stake.rewards.reward &&
                            stake.rewards.reward.claimed
                                .add(stake.rewards.reward.unclaimed)
                                .toSignificant(6, { groupSeparator: ',' })}{' '}
                        {stake.rewards.reward && stake.rewards.reward.claimed.currency.symbol} <br />~
                        {stake.rewards.reward$ &&
                            stake.rewards.reward$.claimed
                                .add(stake.rewards.reward$.unclaimed)
                                .toFixed(2, { groupSeparator: ',' })}
                        $
                    </td>
                ) : (
                    <td className="text-center"> - </td>
                )}
                {stake.protocol !== LIQUIDITY_PROTOCOL.GOODDAO ? (
                    <td className="whitespace-nowrap">
                        {stake.multiplier ? (
                            <>{i18n._(t`This month`)} 2.0X</>
                        ) : (
                            <>
                                {i18n._(t`This month`)} 1.0X
                                <br />
                                {i18n._(t`Next month:`)} 2.0X
                            </>
                        )}
                    </td>
                ) : (
                    <td className="text-center"> - </td>
                )}
                <td>
                    {stake.rewards.GDAO.claimed
                        .add(stake.rewards.GDAO.unclaimed)
                        .toSignificant(6, { groupSeparator: ',' })}{' '}
                    {stake.rewards.GDAO.claimed.currency.symbol}
                </td>
                <td className="flex content-center justify-center">
                    <div className="flex flex-col justify-end" style={{ width: '140px' }}>
                        <ActionOrSwitchButton
                            size="sm"
                            width="100%"
                            borderRadius="6px"
                            noShadow={true}
                            requireChain={requireChain}
                            onClick={handleWithdrawOpen}
                            ButtonEl={ButtonAction}
                        >
                            {i18n._(t`Withdraw Liquidity`)}
                        </ActionOrSwitchButton>
                        {claimableStake && (
                            <ButtonAction
                                className="mt-2"
                                size="sm"
                                borderRadius="6px"
                                onClick={handleClaimRewardsOpen}
                            >
                                {i18n._(t`Claim rewards`)}
                            </ButtonAction>
                        )}
                    </div>
                </td>
            </tr>
            <tr className="mobile">
                <td colSpan={8}>
                    <ActionOrSwitchButton
                        size="sm"
                        width="100%"
                        borderRadius="6px"
                        requireChain={requireChain}
                        onClick={handleWithdrawOpen}
                        ButtonEl={ButtonAction}
                    >
                        {i18n._(t`Withdraw`)}
                    </ActionOrSwitchButton>
                    {claimableStake && (
                        <ButtonAction className="mt-2" size="sm" borderRadius="6px" onClick={handleClaimRewardsOpen}>
                            {i18n._(t`Claim rewards`)}
                        </ButtonAction>
                    )}
                </td>
            </tr>
        </>
    )
})

export default PortfolioTableRow
