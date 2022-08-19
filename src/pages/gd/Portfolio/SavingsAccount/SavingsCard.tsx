import React, {useState, useCallback} from 'react'
import Card from 'components/gd/Card'
import { PortfolioAnalyticSC, PortfolioSC, PortfolioTitleSC, PortfolioValueSC } from '../styled'
import Title from 'components/gd/Title'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useStakerInfo } from '@gooddollar/web3sdk-v2'
import { DAO_NETWORK } from '@gooddollar/web3sdk'
import SavingsModal, { ModalType } from '../../SavingsV2/SavingsModal'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'

export const SavingsCard = ({ account, network}:
  { account:string, network:string}):JSX.Element => {
    const { i18n } = useLingui()
    const { stats, error } = useStakerInfo(30, account, network)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [type, setType] = useState<ModalType>()
    const toggleModal = useCallback(() => {
      if (isModalOpen){
        setType(undefined)
      }
      setIsModalOpen(!isModalOpen)
    }, [setIsModalOpen, isModalOpen])

    return (
      <>
      { type && (
          <SavingsModal type={type} network={network} toggle={toggleModal} isOpen={isModalOpen} />  
      )}   
      <Title className={`md:pl-4`} 
        style={{
          fontSize: "24px",
          backgroundColor: "#f6f8fa"
        }}>{i18n._(t`Savings`)}</Title>
        <Card className="sm:mb-6 md:mb-4 card">
          <PortfolioAnalyticSC className="flex">
            <div className="flex flex-col segment">
              <Title type="category">{i18n._(t`Deposit`)}</Title>
              <PortfolioValueSC>
                {stats?.deposit.toFixed(2)}{' '}G$
              </PortfolioValueSC>
            </div>
            <div className="flex flex-col segment">
              <Title type="category">{i18n._(t`Earned`)}</Title>
              <PortfolioValueSC>
                {stats?.earned.toFixed(2)}{' '}G$
              </PortfolioValueSC>
            </div>
            <div className="flex flex-col segment">
              <Title type="category">{i18n._(t`Rewards Paid`)}</Title>
              <PortfolioValueSC>
                {stats?.rewardsPaid.toFixed(2)}
              </PortfolioValueSC>
            </div>
            <div className="flex items-end justify-center md:flex-col segment withdraw-buttons">
              <div className="h-full withdraw-button md:h-auto">
              <ActionOrSwitchButton
                width="130px"
                size="sm"
                borderRadius="6px"
                requireNetwork={DAO_NETWORK.FUSE}
                noShadow={true}
                onClick={() => {
                setType('withdraw')
                toggleModal()
              }}> {i18n._(t`Withdraw G$`)} </ActionOrSwitchButton>
              <div className={"mb-1"}></div>
              <ActionOrSwitchButton
                width="130px"
                size="sm"
                noShadow={true}
                borderRadius="6px"
                requireNetwork={DAO_NETWORK.FUSE} 
                onClick={() => {
                  setType('claim')
                  toggleModal()
                }}> {i18n._(t`Claim Rewards`)} </ActionOrSwitchButton>
              </div>
            </div>
          </PortfolioAnalyticSC>
        </Card>
      </>
    )
}