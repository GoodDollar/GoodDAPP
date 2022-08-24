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
import Table from 'components/gd/Table'
import { QuestionHelper } from 'components'

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

    const headings = [
      {
        title: i18n._(t`TYPE`),
        questionText: i18n._(
            t``
        )
      },
      {
          title: i18n._(t`TOKEN`),
          questionText: i18n._(t`This is the token that is currently being staked.`)
      },
      {
          title: i18n._(t`PROTOCOL`),
          questionText: i18n._(t`This is the protocol that the token is staked to.`)
      },
      {
          title: i18n._(t`Deposit`),
          questionText: i18n._(t`Total amount on value deposited`)
      },
      {
        title: `${i18n._(t`PAID REWARDS`)}`,
        questionText: i18n._(t`How many rewards there has been withdrawn.`)
      },
      {
          title: `${i18n._(t`CLAIMABLE REWARDS`)}`,
          questionText: i18n._(t`How much tokens your savings has accumulated so far.`)
      },

    ]

    return (
      <>
      { type && (
          <SavingsModal type={type} network={network} toggle={toggleModal} isOpen={isModalOpen} />  
      )}   
        <Card className="sm:mb-6 md:mb-4 card" contentWrapped={false} style={{position: 'relative'}}>
          <Table
            header={
              <tr>
                {headings.map((item, index) => (
                    <th key={index}>
                        <Title type="category" className="flex items-center">
                            {item.title} <QuestionHelper text={item.questionText || ''} />
                        </Title>
                    </th>
                ))}
              </tr>
            }
          >
            <tr>
                <td>{i18n._(t`Savings`)}</td>
                <td>{i18n._(t`G$`)}</td>
                <td>{i18n._(t`GoodDAO`)}</td>
                <td>
                  <div className="flex flex-col segment">
                      {stats?.deposit.toFixed(2)}{' '}G$ <br></br>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col segment">
                      <div>{stats?.rewardsPaid.toFixed(2)} G$</div>
                      <div>?????.?? GOOD</div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col segment">
                    <div>{stats?.earned.toFixed(2)}{' '} G$</div>
                    <div>?????.?? GOOD</div>
                  </div>
                </td>
                <td className="flex content-center justify-center">
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
                </td>
              {/* </PortfolioAnalyticSC> */}
            </tr>
          </Table>
        </Card>
      </>
    )
}