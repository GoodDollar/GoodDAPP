import React, { memo, useCallback, useState } from 'react'
import Withdraw from 'components/Withdraw'
import { MyStake } from '../../sdk/staking'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { LIQUIDITY_PROTOCOL } from 'sdk/constants/protocols'
import { DAO_NETWORK, SupportedChainId } from 'sdk/constants/chains'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ButtonAction, ButtonOutlined } from 'components/gd/Button'
import ClaimRewards from 'components/ClaimRewards'
import sendGa from 'functions/sendGa'

interface PortfolioTableRowProps {
    stake: MyStake
    onUpdate: () => void
}

function PortfolioTableRow({ stake, onUpdate }: PortfolioTableRowProps) {
    const { i18n } = useLingui()
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)
    const [isClaimRewardsOpen, setClaimRewardsOpen] = useState(false)
    const handleClaimRewardsOpen = useCallback(() => setClaimRewardsOpen(true), [])
    const { chainId } = useActiveWeb3React()

    const requireNetwork = stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? DAO_NETWORK.FUSE : DAO_NETWORK.MAINNET
    const claimableStake = (chainId === (SupportedChainId.FUSE as number) && requireNetwork === DAO_NETWORK.FUSE) ||
         (chainId !== (SupportedChainId.FUSE as number) && requireNetwork === DAO_NETWORK.MAINNET)
    const getData = sendGa
    const network = stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? 'fuse' : 'mainnet' 
    const handleWithdrawOpen = useCallback(() => {
      getData({event: 'stake', action: 'withdrawStart', network: network})
      setWithdrawOpen(true)
    }, [])

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
                token={`${stake.tokens.A.symbol}`}
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
                <td>
                    <div className="flex flex-col justify-end">
                        <ActionOrSwitchButton
                            size="sm"
                            width="100%"
                            borderRadius="6px"
                            noShadow={true}
                            requireNetwork={requireNetwork}
                            onClick={handleWithdrawOpen}
                            ButtonEl={ButtonOutlined}
                        >
                            {i18n._(t`Withdraw Liquidity`)}
                        </ActionOrSwitchButton>
                        {
                        claimableStake &&
                            <ButtonOutlined 
                                className='mt-2' 
                                size='sm' 
                                borderRadius="6px" 
                                onClick={handleClaimRewardsOpen}
                            >
                                {i18n._(t`Claim rewards`)}
                            </ButtonOutlined>
                        }
                    </div>
                </td>
            </tr>
            <tr className="mobile">
                <td colSpan={8}>
                    <ActionOrSwitchButton
                        size="sm"
                        width="100%"
                        borderRadius="6px"
                        requireNetwork={requireNetwork}
                        onClick={handleWithdrawOpen}
                        ButtonEl={ButtonOutlined}
                    >
                        {i18n._(t`Withdraw`)}
                    </ActionOrSwitchButton>
                    {   
                         claimableStake &&
                            <ButtonOutlined 
                                className='mt-2' 
                                size='sm'  
                                borderRadius="6px" 
                                onClick={handleClaimRewardsOpen}
                            >
                                {i18n._(t`Claim rewards`)}
                            </ButtonOutlined>
                    }
                    </td>
            </tr>
        </>
    )
}

export default memo(PortfolioTableRow)
