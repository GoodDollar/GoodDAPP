import React, { memo, useCallback, useEffect, useState, useMemo } from 'react'
import { ClaimRewardsStyled } from 'components/ClaimRewards/styled'
import Modal from 'components/Modal'
import { ReactComponent as CrossSVG } from 'assets/images/x.svg'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'
import Button from 'components/Button'
import { MyStake, withdraw } from '../../sdk/staking'
import useWeb3 from '../../hooks/useWeb3'
import { addTransaction } from '../../state/transactions/actions'
import { useDispatch } from 'react-redux'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { getExplorerLink } from '../../utils'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Loader from 'components/Loader'
import { LIQUIDITY_PROTOCOL } from 'sdk/constants/protocols'

function formatNumber(value: number) {
    return Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 4 }).format(value)
}

interface ClaimProps {
    token: string
    protocol: string
    open: boolean
    setOpen: (value: boolean) => void
    onWithdraw: () => void
    stake: MyStake
}

type ClaimState = 'none' | 'pending' | 'send' | 'success'

function ClaimRewards({ token, protocol, open, setOpen, onWithdraw, stake, ...rest }: ClaimProps) {
    const { i18n } = useLingui()
    const [status, setStatus] = useState<ClaimState>('none')
    const web3 = useWeb3()
    const { chainId } = useActiveWeb3React()
    const [error, setError] = useState<Error>()

    const isGovStake = protocol === LIQUIDITY_PROTOCOL.GOODDAO

    const dispatch = useDispatch()
    const [transactionHash, setTransactionHash] = useState<string>()

    // const handleWithdraw = useCallback(async () => {
    //     if (!web3) return
    //     try {
    //         setStatus('pending')
    //         await withdraw(
    //             web3,
    //             stake,
    //             percentage,
    //             !isGovStake && withdrawInInterestToken,
    //             (transactionHash: string, from: string) => {
    //                 setTransactionHash(transactionHash)
    //                 setStatus('send')
    //                 dispatch(
    //                     addTransaction({
    //                         chainId: chainId!,
    //                         hash: transactionHash,
    //                         from: from,
    //                         summary: i18n._(t`Withdrew funds from ${stake.protocol} `)
    //                     })
    //                 )
    //             },
    //             () => {
    //                 setStatus('success')
    //             },
    //             e => {
    //                 setStatus('none')
    //                 setError(e as Error)
    //             }
    //         )
    //         onWithdraw()
    //     } catch (e) {
    //         console.error(e)
    //         setStatus('none')
    //     }
    // }, [setStatus, onWithdraw, percentage])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    return (
        <Modal isOpen={open} noPadding onDismiss={handleClose}>
            <ClaimRewardsStyled {...rest}>
                <div className="flex justify-end flex-grow">
                    <CrossSVG className="cursor-pointer" onClick={handleClose} />
                </div>
                {status === 'none' || status === 'pending' ? (
                    <>
                        <Title className="flex justify-center flex-grow pt-3 pb-3 title">{i18n._(t`Claimable Rewards`)}</Title>
                        
                        <div className="relative flex flex-col items-center gap-1 mt-7">
                            <p className="mb-5 warning">{error ? error.message : ''}</p>
                            <ButtonAction className="withdraw" disabled={status === 'pending'} onClick={() => ''}>
                                {status === 'pending'
                                    ? i18n._(t`PENDING SIGN...`)
                                    : `${i18n._(t`Claim Rewards`)}`}
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
                    </>
                ) : (
                    <>
                        <Title className="flex justify-center flex-grow pt-3">{i18n._(t`Success!`)}</Title>
                        <div className="flex items-center justify-center gap-2 pt-7 pb-7">
                            {status === 'send'
                                ? i18n._(t`Transaction was sent to the blockchain `)
                                : i18n._(t`You have successfully claimed your rewards `)}
                            <a
                                href={
                                    transactionHash &&
                                    chainId &&
                                    getExplorerLink(chainId, transactionHash, 'transaction')
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
                    </>
                )}
            </ClaimRewardsStyled>
        </Modal>
    )
}

export default memo(ClaimRewards)
