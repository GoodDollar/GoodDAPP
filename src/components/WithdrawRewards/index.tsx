import React, { memo, useCallback, useState } from 'react'
import { ReactComponent as CrossSVG } from 'assets/images/x.svg'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'
import { WithdrawRewardsStyled } from 'components/WithdrawRewards/styled'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import { ButtonEmpty } from 'components/ButtonLegacy'

interface WithdrawRewardsProps {
    onClose: () => void
}

type WithdrawRewardsState = 'none' | 'pending' | 'success'

function WithdrawRewards({ onClose, ...rest }: WithdrawRewardsProps) {
    const [status, setStatus] = useState<WithdrawRewardsState>('none')
    const handleClaim = useCallback(() => {
        setStatus('pending')
        setTimeout(() => setStatus('success'), 3000)
    }, [setStatus])

    return (
        <WithdrawRewardsStyled {...rest}>
            <div className="flex flex-grow justify-end">
                {onClose && <CrossSVG className="cursor-pointer" onClick={onClose} />}
            </div>
            {status === 'none' || status === 'pending' ? (
                <>
                    <Title className="flex flex-grow justify-center pt-3">Claimable Rewards</Title>
                    <p className="warning">
                        Warning message goes here...
                        <br />
                        Warning message goes here...
                    </p>
                    <div className="flex flex-col items-center gap-1 relative">
                        <ButtonAction className="claim-reward" disabled={status === 'pending'} onClick={handleClaim}>
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
                        <a>
                            <LinkSVG className="cursor-pointer" />
                        </a>
                    </div>
                    <div className="flex justify-center">
                        <ButtonEmpty className="back-to-portfolio" width="fit-content" onClick={onClose}>
                            Back to portofolio
                        </ButtonEmpty>
                    </div>
                </>
            )}
        </WithdrawRewardsStyled>
    )
}

export default memo(WithdrawRewards)
