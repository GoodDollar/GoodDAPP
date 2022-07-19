import React from 'react'

import Table from 'components/gd/Table'
import { useStakerInfo } from '@gooddollar/web3sdk-v2'
import { QuestionHelper } from 'components'
import Title from 'components/gd/Title'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

export const SavingsAccount = ({account, network}: {account: string, network: string}):JSX.Element => {
  const { i18n } = useLingui()
  const { stakerInfo } = useStakerInfo(2, account, network)
  
  const headings = [
    {
      title: i18n._(t`Deposit`),
      questionText: i18n._(t`The amount of deposited G$'s`),
    },
    {
      title: i18n._(t`Rewards Donated`),
      questionText: i18n._(t`How much rewards you have donated across your deposits`),
    },
    {
      title: i18n._(t`Rewards Paid`),
      questionText: i18n._(t`How much rewards you have received from your savings`),
    },
    {
      title: i18n._(t`Average Donation`),
      questionText: i18n._(t`This is the average of the amount you donate`),
    },
    {
      title: i18n._(t`shares`),
      questionText: i18n._(t`The amount of shares you hold`),
    }
  ]

  return (
  <>
    <span>Active Savings Account</span>
    <>
      {
        stakerInfo && stakerInfo instanceof Error ? 'No active stakes' : 
        <div>
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
            }>
            <tr>
              <td>G$ {stakerInfo?.deposit}</td>
              <td>{stakerInfo?.rewardsDonated}</td>
              <td>{stakerInfo?.rewardsPaid}</td>
              <td>{stakerInfo?.avgDonationRatio}%</td>
              <td>{stakerInfo?.shares}</td>
            </tr>

          </Table>
            
        </div>          
      }
    </>
  </>
  )
}