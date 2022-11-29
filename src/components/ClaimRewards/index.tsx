import React, { memo, useCallback, useEffect, useState, createElement } from 'react'
import { ClaimRewardsStyled } from 'components/ClaimRewards/styled'
import Modal from 'components/Modal'
import { ReactComponent as CrossSVG } from 'assets/images/cross.svg'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'
import Button from 'components/Button'
import { addTransaction } from '../../state/transactions/actions'
import { useDispatch } from 'react-redux'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { getExplorerLink } from '../../utils'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Loader from 'components/Loader'
import { ChekboxItem, Reward } from './components'
import { BottomSheet } from 'react-spring-bottom-sheet'

import {
    claimG$Reward,
    claimGoodReward,
    MyStake,
    useGdContextProvider,
    LIQUIDITY_PROTOCOL,
    SupportedChainId,
} from '@gooddollar/web3sdk'

import 'react-spring-bottom-sheet/dist/style.css'
import { useWindowSize } from 'hooks/useWindowSize'
import styled from 'styled-components'
import { type } from 'os'

const BottomSheetSC = styled(BottomSheet)`
    & div {
        z-index: 99;
    }
`

interface ClaimProps {
    token: string
    protocol: string
    open: boolean
    setOpen: (value: boolean) => void
    onClaim: () => void
    stake: MyStake
}

type ClaimState = 'none' | 'pending' | 'send' | 'success'

const Content = ({
    handleClose,
    handleClaim,
    isGovStake,
    selectedReward,
    setSelectedReward,
    error,
    chainId,
    transactionHash,
    stake,
    status,
    ...rest
}: any) => {
    const { i18n } = useLingui()

    return (
        <ClaimRewardsStyled {...rest}>
            <div className="flex justify-end flex-grow">
                <CrossSVG className="cursor-pointer" onClick={handleClose} width={16} height={16} />
            </div>
            {status === 'none' || status === 'pending' ? (
                <div className="m-6 mt-0">
                    <Title className="flex justify-center flex-grow pt-2 pb-2 title">
                        {i18n._(t`Claimable Rewards`)}
                    </Title>
                    {!isGovStake && (
                        <div className="flex justify-center">
                            <ChekboxItem
                                name={'claimAll'}
                                checked={selectedReward === 'claimAll'}
                                onClick={() => setSelectedReward('claimAll')}
                                label={i18n._(t`Claim All`)}
                            />
                            <ChekboxItem
                                name={'claimGOOD'}
                                checked={selectedReward === 'claimGOOD'}
                                onClick={() => setSelectedReward('claimGOOD')}
                                label={i18n._(t`Claim GOOD`)}
                            />
                        </div>
                    )}
                    <div className="relative flex flex-col items-center mt-1">
                        {error && <p className="mb-5 warning">{error.message}</p>}
                        <ButtonAction className="claim" disabled={status === 'pending'} onClick={handleClaim}>
                            {status === 'pending' ? i18n._(t`PENDING SIGN...`) : `${i18n._(t`Claim Rewards`)}`}
                        </ButtonAction>
                        {!isGovStake && (
                            <p className="mb-2 text-center claiming-hint">
                                {i18n._(t`Claiming your rewards will reset your multiplier`)}
                            </p>
                        )}
                        {status === 'pending' && (
                            <p className="pending-hint">You need to sign the transaction in your wallet</p>
                        )}
                    </div>
                    <div>
                        <p className="mb-1 availableRewards">{i18n._(t`Claiming the following rewards:`)}</p>
                        {!isGovStake && (
                            <Reward
                                name={i18n._(t`G$`)}
                                amount={stake.rewards.reward.unclaimed.toSignificant(6, { groupSeperator: ',' })}
                                active={selectedReward === 'claimAll'}
                            />
                        )}
                        <Reward
                            name={i18n._(t`GOOD`)}
                            amount={stake.rewards.GDAO.unclaimed.toSignificant(6, { groupSeperator: ',' })}
                            active={true}
                        />
                    </div>
                </div>
            ) : (
                <div className="m-6 mt-0">
                    <Title className="flex justify-center flex-grow pt-3">
                        {status === 'send' ? i18n._(t`Please wait`) : i18n._(t`Success!`)}
                    </Title>
                    <div className="flex items-center justify-center gap-2 pt-7 pb-7">
                        {status === 'send'
                            ? i18n._(t`Transaction was sent to the blockchain `)
                            : i18n._(t`You have successfully claimed your rewards `)}
                        <a
                            href={
                                transactionHash && chainId && getExplorerLink(chainId, transactionHash, 'transaction')
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <LinkSVG className="cursor-pointer" />
                        </a>
                    </div>
                    <div className="flex justify-center">
                        {status === 'send' ? (
                            <Loader stroke="#173046" size="32px" />
                        ) : (
                            <Button className="back-to-portfolio" onClick={handleClose}>
                                {i18n._(t`Back to portfolio`)}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </ClaimRewardsStyled>
    )
}

const ClaimRewards = memo(({ token, protocol, open, setOpen, onClaim, stake, ...rest }: ClaimProps) => {
    const { i18n } = useLingui()
    const [status, setStatus] = useState<ClaimState>('none')
    const { web3 } = useGdContextProvider()
    const { chainId } = useActiveWeb3React()
    const [error, setError] = useState<Error>()
    const [selectedReward, setSelectedReward] = useState<'claimAll' | 'claimGOOD'>('claimAll')
    const { width } = useWindowSize()
    const isMobile = width ? width <= 768 : undefined

    const isGovStake = protocol === LIQUIDITY_PROTOCOL.GOODDAO

    const [transactionHash, setTransactionHash] = useState<string>()
    const dispatch = useDispatch()

    useEffect(() => {
        if ((chainId as any) === SupportedChainId.FUSE) setSelectedReward('claimGOOD')
    }, [selectedReward, chainId])

    const handleClaim = useCallback(async () => {
        if (!web3) return
        try {
            setStatus('pending')
            const claimMethod = selectedReward === 'claimGOOD' ? claimGoodReward : claimG$Reward
            const transactions = await claimMethod(
                web3,
                stake.address,
                (txHash: string, from: string, chainId: number) => {
                    setTransactionHash(txHash)
                    setStatus('send')
                    dispatch(
                        addTransaction({
                            chainId: chainId!,
                            hash: txHash,
                            from: from,
                            summary:
                                selectedReward === 'claimGOOD'
                                    ? i18n._(t`Claimed GOOD Rewards`)
                                    : i18n._(t`Claimed G$ Rewards`),
                        })
                    )
                },
                () => {
                    setStatus('success')
                },
                (e) => {
                    // for TX errors
                    setStatus('none')
                    setError(e as Error)
                }
            )

            onClaim()
        } catch (e) {
            // keep for now? for errors I have not seen yet -lewis
            setStatus('none')
            setError(e as Error)
        }
    }, [setStatus, onClaim, type, selectedReward])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    const content = createElement(Content, {
        handleClose,
        handleClaim,
        isGovStake,
        selectedReward,
        setSelectedReward,
        error,
        chainId,
        transactionHash,
        stake,
        status,
        ...rest,
    })

    useEffect(() => {
        if (isGovStake) {
            setSelectedReward('claimGOOD')
        }
    }, [isGovStake])

    useEffect(() => {
        if (open) {
            setSelectedReward('claimAll')
        }
        if (open && status !== 'none') {
            setStatus('none')
            setTransactionHash(undefined)
        }
    }, [open])

    return isMobile ? (
        <BottomSheetSC open={open} onDismiss={handleClose}>
            {content}
        </BottomSheetSC>
    ) : (
        <Modal isOpen={open} noPadding onDismiss={handleClose} maxWidth={368}>
            {content}
        </Modal>
    )
})

export default ClaimRewards
