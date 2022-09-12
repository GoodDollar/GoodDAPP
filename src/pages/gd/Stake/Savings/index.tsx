import React, { useCallback, useState } from 'react'
import Table from 'components/gd/Table'
import Title from 'components/gd/Title'
import { QuestionHelper } from 'components'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { DAO_NETWORK, SupportedChainId, G$ } from '@gooddollar/web3sdk'
import { useGlobalStats } from '@gooddollar/web3sdk-v2'
import SavingsModal from '../../SavingsV2/SavingsModal'
import { Wrapper } from '../styled'
import styled from 'styled-components'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import { ChainId } from '@sushiswap/sdk'
import AsyncTokenIcon from 'components/gd/sushi/AsyncTokenIcon'

const SavingsDeposit = styled.div`
  margin-top: 10px;
`

export const Savings = ({network, chainId}:{network: DAO_NETWORK, chainId: ChainId}):JSX.Element  => {
  const [isOpen, setIsOpen] = useState(false)
  const { stats, error } = useGlobalStats(30, 'fuse')
  const { i18n } = useLingui()
  const toggleModal = useCallback(() => setIsOpen(!isOpen), [setIsOpen, isOpen])
  const g$ = G$[chainId]

  const headings = [
    {
      title: i18n._(t`Token`),
      questionText: i18n._(t`This is the token that you can deposit into the savings contract.`)
    },
    {
      title: i18n._(t`Protocol`),
      questionText: i18n._(t`Your current savings balance.`),
    },
    {
      title: i18n._(t`Fixed Apy`),
      questionText: i18n._(t`The fixed annual interest.`),
    },
    // {
    //   title: i18n._(t`G$'s to withdraw`),
    //   questionText: i18n._(t`How much G$'s you have earned with your savings account`),
    // },
    {
      title: i18n._(t`Total Staked`),
      questionText: i18n._(t`Total currently saved.`)
    },
    {
      title: i18n._(t`Total Rewards Paid`),
      questionText: i18n._(t`Total rewards claimed.`),
    },
  ]
  return (
    <SavingsDeposit>
      <div className="mt-12"></div>
      { chainId === (SupportedChainId.FUSE as number) && (
          <SavingsModal type="deposit" network={network} toggle={toggleModal} isOpen={isOpen} />
        )
      }
      <Title className={`md:pl-4`}>{i18n._(t`Savings`)}</Title>
      <div className="mt-4"></div>
      <Wrapper>
        <Table
          header={
              <tr>
                  <th>{/* icon */}</th> 
                  {headings.map((item, index) => (
                      <th key={index}>
                          <Title type="category" className="flex items-center">
                              {item.title} <QuestionHelper text={item.questionText || ''} />
                          </Title>
                      </th>
                  ))}
              </tr>
          }>
          <tr>
            <td>
              <AsyncTokenIcon 
                address={g$.address} 
                chainId={g$.chainId} 
                className={"block w-5 h-5 mr-2 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"}/>
            </td>
            <td>G$</td>
            <td>GoodDollar</td>
            <td>{stats?.apy.toFixed(0)}%</td>
            <td>G$ {stats?.totalStaked.toFixed(2, {groupSeparator: ','})}</td>
            <td>G$ {stats?.totalRewardsPaid.toFixed(2, {groupSeparator: ','})}</td>
            <td>
              <ActionOrSwitchButton 
                size="sm"
                width="130px"
                borderRadius="6px"
                noShadow={true}
                requireNetwork={network}
                onClick={toggleModal}> Deposit G$ </ActionOrSwitchButton>
            </td>
          </tr>
        </Table>
      </Wrapper>
    </SavingsDeposit>   
  )
}