// import React, { useState, useCallback, useEffect } from 'react'

// import { useStakerInfo} from '@gooddollar/web3sdk-v2'
// import { useLingui } from '@lingui/react'
// import { t } from '@lingui/macro'
// import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
// import { SavingsStats } from './SavingsStats'
// import SavingsModal, {ModalType} from '../SavingsModal'

// export const SavingsAccount = ({account, network}: {account: string, network: string}):JSX.Element => {
//   const { stats, error } = useStakerInfo(30, account, network)

//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [type, setType] = useState<ModalType>()
//   const toggleModal = useCallback(() => {
//     if (isModalOpen){
//       setType(undefined)
//     }
//     setIsModalOpen(!isModalOpen)
//   }, [setIsModalOpen, isModalOpen])

//   return (
//   <>
//   {
//     !error && stats && (
//       <>
//         <button style={{
//           border: '1px solid blue', 
//           borderRadius: '5px',
//           padding: '5px',
//           marginTop: '10px'
//         }}onClick={() => {
//           setType('withdraw')
//           toggleModal()
//         }}> Withdraw G$ </button>
//         <button style={{
//           border: '1px solid blue', 
//           borderRadius: '5px',
//           padding: '5px',
//           marginTop: '10px'
//         }}onClick={() => {
//           setType('claim')
//           toggleModal()
//         }}> Claim Rewards </button>
        
//       {
//         type && (
//           <SavingsModal type={type} network={network} toggle={toggleModal} isOpen={isModalOpen} />
//         )
//       }
//       <>
//         <SavingsStats stakerInfo={stats} />        
//       </>
//     </>)}
//   </>
//   )
// }
export {}