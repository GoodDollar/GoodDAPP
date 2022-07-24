import React, { useState, useCallback, useEffect } from 'react'

import { useStakerInfo} from '@gooddollar/web3sdk-v2'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { SavingsStats } from './SavingsStats'
import { SavingsModal } from '../SavingsModal'

export const SavingsAccount = ({account, network}: {account: string, network: string}):JSX.Element => {
  const { chainId } = useActiveWeb3React()
  const { i18n } = useLingui()
  const { stats, error } = useStakerInfo(30, account, network)

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const toggleModal = useCallback(() => setIsWithdrawOpen(!isWithdrawOpen), [setIsWithdrawOpen, isWithdrawOpen])

  return (
  <>
  {
    !error && stats && (
      <>
        <button style={{
          border: '1px solid blue', 
          borderRadius: '5px',
          padding: '5px',
          marginTop: '10px'
        }}onClick={toggleModal}> Withdraw G$ </button>

        <SavingsModal type='withdraw' network={network} toggle={toggleModal} isOpen={isWithdrawOpen} />
      <>
        <SavingsStats stakerInfo={stats} />        
      </>
    </>)}
  </>
  )
}