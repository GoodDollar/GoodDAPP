import React, { memo, useCallback, useEffect, useState } from 'react'
import { WithdrawStyled } from 'components/Withdraw/styled'
import Modal from 'components/Modal'
import { ReactComponent as CrossSVG } from 'assets/images/x.svg'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'

import PercentInputControls from 'components/Withdraw/PercentInputControls'
import Button from 'components/Button'
import { MyStake, withdraw } from '../../sdk/staking'
import useWeb3 from '../../hooks/useWeb3'

function formatNumber(value: number) {
    return Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 4 }).format(value)
}

interface WithdrawProps {
    token: string
    protocol: string
    totalStake: number
    open: boolean
    setOpen: (value: boolean) => void
    onWithdraw: () => void
    stake: MyStake
}

type WithdrawState = 'none' | 'pending' | 'success'

function Withdraw({ token, protocol, totalStake, open, setOpen, onWithdraw, stake, ...rest }: WithdrawProps) {
    const [status, setStatus] = useState<WithdrawState>('none')

    const [percentage, setPercentage] = useState<string>('50')
    const [withdrawAmount, setWithdrawAmount] = useState<number>(totalStake * (Number(percentage) / 100))

    useEffect(() => {
        setWithdrawAmount(totalStake * (Number(percentage) / 100))
    }, [percentage])

    const web3 = useWeb3()
    const handleWithdraw = useCallback(async () => {
        if (!web3) return
        try {
            setStatus('pending')
            await withdraw(web3, stake.address, parseFloat(percentage))
            setStatus('success')
            onWithdraw()
        } catch (e) {
            console.error(e)
            setStatus('none')
        }
    }, [setStatus, onWithdraw])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    useEffect(() => {
        if (open) setPercentage('50')
        if (open && status !== 'none') setStatus('none')
    }, [open])

    return (
        <Modal isOpen={open} noPadding onDismiss={handleClose}>
            <WithdrawStyled {...rest}>
                <div className="flex flex-grow justify-end">
                    <CrossSVG className="cursor-pointer" onClick={handleClose} />
                </div>
                {status === 'none' || status === 'pending' ? (
                    <>
                        <Title className="flex flex-grow justify-center pt-3 pb-3">Withdraw</Title>
                        <div className="details-row flex justify-between">
                            <div>Token</div>
                            <div>{token}</div>
                        </div>
                        <div className="details-row flex justify-between">
                            <div>Protocol</div>
                            <div>{protocol}</div>
                        </div>
                        <div className="details-row flex justify-between">
                            <div>Total stake</div>
                            <div>{`${formatNumber(totalStake)} ${token}`}</div>
                        </div>

                        <div className="horizontal mt-4 mb-2" />

                        <PercentInputControls
                            value={percentage}
                            onPercentChange={setPercentage}
                            disabled={status === 'pending'}
                        />

                        <div className="flex flex-col items-center gap-1 relative mt-7">
                            <ButtonAction className="withdraw" disabled={status === 'pending'} onClick={handleWithdraw}>
                                {status === 'pending'
                                    ? 'PENDING SIGN...'
                                    : `WITHDRAW ${formatNumber(withdrawAmount)} ${token.toUpperCase()}`}
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
                            <a>
                                <LinkSVG className="cursor-pointer" />
                            </a>
                        </div>
                        <div className="flex justify-center">
                            <Button className="back-to-portfolio" onClick={handleClose}>
                                Back to portfolio
                            </Button>
                        </div>
                    </>
                )}
            </WithdrawStyled>
        </Modal>
    )
}

export default memo(Withdraw)
