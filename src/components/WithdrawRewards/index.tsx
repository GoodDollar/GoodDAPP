import React, { cloneElement, memo, ReactElement, useCallback, useEffect, useState } from 'react'
import { ReactComponent as CrossSVG } from 'assets/images/x.svg'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'
import { WithdrawRewardsStyled } from 'components/WithdrawRewards/styled'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import Modal from 'components/Modal'
import Button from 'components/Button'
import { claimG$Rewards, claimGoodRewards } from '../../sdk/staking'
import useWeb3 from '../../hooks/useWeb3'
import { TransactionDetails } from '../../sdk/constants/transactions'
import { useDispatch } from 'react-redux'
import { addTransaction } from '../../state/transactions/actions'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { getExplorerLink } from '../../utils'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { SupportedChainId } from '../../sdk/constants/chains'
import Loader from 'components/Loader'

interface WithdrawRewardsProps {
    trigger: ReactElement<{ onClick: Function }>
    type: 'GOOD' | 'G$',
    onClaim: () => void
}

type WithdrawRewardsState = 'none' | 'pending' | 'send' | 'success'

function WithdrawRewards({ trigger, type, onClaim, ...rest }: WithdrawRewardsProps) {
    const { i18n } = useLingui()
    const [status, setStatus] = useState<WithdrawRewardsState>('none')
    const [error, setError] = useState<Error>()
    const web3 = useWeb3()
    const dispatch = useDispatch()

    const [transactionList, setTransactionHash] = useState<any[]>([])

    const handleClaim = useCallback(async () => {
        if (!web3) return 
        try {
            setStatus('pending')
            const claimMethod = type === 'GOOD' ? claimGoodRewards : claimG$Rewards; 
            const transactions = await claimMethod(web3, (txHash: string, from: string, chainId: number) => {
              setTransactionHash(transactionHash => [...transactionHash, [{hash: txHash, chainId: chainId}]])
              setStatus('send') 
              dispatch(
                addTransaction({ 
                  chainId: chainId!,
                  hash: txHash,
                  from: from,
                  summary: type === 'GOOD' ?
                    i18n._(t`Claimed GOOD Rewards`) :
                    i18n._(t`Claimed G$ Rewards`) 
                })
              )
            }, () => {
              setStatus('success')
            }, (e) => { // for TX errors
              setStatus('none')
              setError(e as Error) 
            })

            onClaim()
        } catch (e) {  // keep for now? for errors I have not seen yet -lewis
          setStatus('none') 
          setError(e as Error)
        }
    }, [setStatus, onClaim, type])

    const [isModalOpen, setModalOpen] = useState(false)
    const handleClose = useCallback(() => {
        setModalOpen(false)
    }, [])

    useEffect(() => {
        if (isModalOpen && status !== 'none') {
            setStatus('none')
            setError(undefined)
            setTransactionHash([undefined])
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
                            <Title className="flex flex-grow justify-center pt-3 mb-5">
                                {i18n._(t`Claimable Rewards`)}
                            </Title>
                            {<p className="warning mb-5">{error ? error.message : ''}</p>}
                            {type === 'G$' && <p className="warning mb-5 text-center">
                                {i18n._(t`Claiming your rewards will reset your multiplier.`)}
                            </p>}
                            <div className="flex flex-col items-center gap-1 relative">
                                <ButtonAction
                                    className="claim-reward"
                                    disabled={status === 'pending'}
                                    onClick={handleClaim}
                                >
                                    {status === 'pending' ? 'PENDING SIGN...' : 'CLAIM REWARD'}
                                </ButtonAction>
                                {status === 'pending' && (
                                    <p className="pending-hint">
                                        {i18n._(t`You need to sign the transaction in your wallet`)}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Title className="flex flex-grow justify-center pt-3">
                              {status === 'send' ? i18n._(t`Success!`) : i18n._(t`Congratulations!`)}
                            </Title>
                            <div className="flex justify-center items-center gap-2 pt-7 pb-7">
                                { status === 'send' ?
                                  i18n._(t`Transaction was sent to the blockchain `) :
                                  i18n._(t`You have successfully claimed your rewards `) } 
                         
                                  {transactionList && (transactionList.map((tx, i) => (
                                      <a target='_blank' 
                                        rel='noreferrer' 
                                        key={i} href={tx[i].chainId && getExplorerLink(tx[i].chainId, tx[i].hash, 'transaction')}> 
                                        <LinkSVG className="cursor-pointer" />  
                                      </a> 
                                  )))}
                            </div>
                            <div className="flex justify-center">
                                { status === 'send' ?
                                  <Loader stroke="#173046" size="32px" /> : 
                                  <Button className="back-to-portfolio" onClick={handleClose}>
                                    {i18n._(t`Back to portfolio`)}
                                  </Button> }
                            </div>
                        </>
                    )}
                </WithdrawRewardsStyled>
            </Modal>
        </>
    )
}

export default memo(WithdrawRewards)
