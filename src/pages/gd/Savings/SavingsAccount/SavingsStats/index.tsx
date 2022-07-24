import React from 'react'
import Table from 'components/gd/Table'
import Title from 'components/gd/Title'
import { QuestionHelper } from 'components'
import type { StakerInfo } from '@gooddollar/web3sdk-v2'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

export const SavingsStats = ({stakerInfo}:{stakerInfo: StakerInfo}):JSX.Element  => {
  const { i18n } = useLingui()

  const headings = [
    {
      title: i18n._(t`Balance`),
      questionText: i18n._(t`Your current savings balance`),
    },
    {
      title: i18n._(t`G$'s to withdraw`),
      questionText: i18n._(t`How much G$'s you have earned with your savings account`),
    },
    {
      title: i18n._(t`G$'s to donate`),
      questionText: i18n._(t`How much rewards you have donated across your deposits`),
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
    <div>
      <span>Active Savings Account</span>
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
          <td>G$ {stakerInfo?.earnedAfterDonation}</td>
          <td>G$ {stakerInfo?.totalToDonate}</td>
          <td>G$ {stakerInfo?.rewardsDonated}</td>
          <td>G$ {stakerInfo?.rewardsPaid}</td>
          <td>{stakerInfo?.avgDonationRatio}%</td>
          <td>{stakerInfo?.shares}</td>
        </tr>

      </Table>
    </div>   
  )
}