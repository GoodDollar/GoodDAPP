import React, { cloneElement, memo, ReactElement, useCallback, useEffect, useState } from 'react'
import { ReactComponent as CrossSVG } from 'assets/images/x.svg'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'
import { WithdrawRewardsStyled } from 'components/WithdrawRewards/styled'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import Modal from 'components/Modal'
import Button from 'components/Button'
import { claim } from '../../sdk/staking'
import useWeb3 from '../../hooks/useWeb3'
import { TransactionDetails } from '../../sdk/constants/transactions'
import { useDispatch } from 'react-redux'
import { addTransaction } from '../../state/transactions/actions'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { getExplorerLink } from '../../utils'

interface WithdrawRewardsProps {
    trigger: ReactElement<{ onClick: Function }>
    onClaim: () => void
}

type WithdrawRewardsState = 'none' | 'pending' | 'success'

function WithdrawRewards({ trigger, onClaim, ...rest }: WithdrawRewardsProps) {
    const [status, setStatus] = useState<WithdrawRewardsState>('none')
    const { chainId } = useActiveWeb3React()
    const [error, setError] = useState<Error>()
    const web3 = useWeb3()
    const [transactionHash, setTransactionHash] = useState<string>()
    const dispatch = useDispatch()
    const handleClaim = useCallback(async () => {
        if (!web3) return
        try {
            setStatus('pending')
            const transactions = await claim(web3, firstTransactionHash => {
                setTransactionHash(firstTransactionHash)
                setStatus('success')
            })
            transactions.forEach(transactionDetails =>
                dispatch(
                    addTransaction({
                        chainId: chainId!,
                        hash: transactionDetails.transactionHash,
                        from: transactionDetails.from
                    })
                )
            )
            onClaim()
        } catch (e) {
            setStatus('none')
            setError(e)
        }
    }, [setStatus, onClaim])
    const [isModalOpen, setModalOpen] = useState(false)
    const handleClose = useCallback(() => {
        setModalOpen(false)
    }, [])

    useEffect(() => {
        if (isModalOpen && status !== 'none') {
            setStatus('none')
            setError(undefined)
            setTransactionHash(undefined)
        }
    }, [isModalOpen])

    return (
        <>
            {trigger && cloneElement(trigger, { onClick: () => setModalOpen(true) })}

            <Modal isOpen={isModalOpen} noPadding onDismiss={handleClose}>
                <WithdrawRewardsStyled {...rest}>
                    <div className="flex flex-grow justify-end">
                        <CrossSVG className="cursor-pointer" onClick={handleClose} />
                    </div>
                    {status === 'none' || status === 'pending' ? (
                        <>
                            <Title className="flex flex-grow justify-center pt-3 mb-5">Claimable Rewards</Title>
                            {
                                <p className="warning mb-5">
                                    {error ? (
                                        error.message
                                    ) : (
                                        <>
                                            Warning message goes here... <br /> Warning message goes here...
                                        </>
                                    )}
                                </p>
                            }
                            <div className="flex flex-col items-center gap-1 relative">
                                <ButtonAction
                                    className="claim-reward"
                                    disabled={status === 'pending'}
                                    onClick={handleClaim}
                                >
                                    {status === 'pending' ? 'PENDING SIGN...' : 'CLAIM REWARD'}
                                </ButtonAction>
                                {status === 'pending' && (
                                    <p className="pending-hint">You need to sign the transaction in your wallet</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Title className="flex flex-grow justify-center pt-3">Success!</Title>
                            <div className="flex justify-center items-center gap-2 pt-7 pb-7">
                                Transaction was sent to the blockchain{' '}
                                {transactionHash && (
                                    <a href={chainId && getExplorerLink(chainId, transactionHash, 'transaction')}>
                                        <LinkSVG className="cursor-pointer" />
                                    </a>
                                )}
                            </div>
                            <div className="flex justify-center">
                                <Button className="back-to-portfolio" onClick={handleClose}>
                                    Back to portfolio
                                </Button>
                            </div>
                        </>
                    )}
                </WithdrawRewardsStyled>
            </Modal>
        </>
    )
}

export default memo(WithdrawRewards)
