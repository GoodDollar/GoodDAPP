// import React from 'react'
// import Table from 'components/gd/Table'
// import Title from 'components/gd/Title'
// import { QuestionHelper } from 'components'
// import type { StakerInfo } from '@gooddollar/web3sdk-v2'
// import { useLingui } from '@lingui/react'
// import { t } from '@lingui/macro'

// export const SavingsStats = ({stakerInfo}:{stakerInfo: StakerInfo}):JSX.Element  => {
//   const { i18n } = useLingui()

//   const headings = [
//     {
//       title: i18n._(t`Balance`),
//       questionText: i18n._(t`Your current savings balance`),
//     },
//     // {
//     //   title: i18n._(t`G$'s to withdraw`),
//     //   questionText: i18n._(t`How much G$'s you have earned with your savings account`),
//     // },
//     {
//       title: i18n._(t`Rewards Earned`),
//       questionText: i18n._(t`How much rewards are pending to be claimed`)
//     },
//     {
//       title: i18n._(t`lastSharePrice`),
//       questionText: i18n._(t`Last share price`),
//     },
//     {
//       title: i18n._(t`shares`),
//       questionText: i18n._(t`The amount of shares you hold`),
//     }
//   ]
//   return (
//     <div>
//       <span>Active Savings Account</span>
//       <Table
//         header={
//             <tr>
//                 {headings.map((item, index) => (
//                     <th key={index}>
//                         <Title type="category" className="flex items-center">
//                             {item.title} <QuestionHelper text={item.questionText || ''} />
//                         </Title>
//                     </th>
//                 ))}
//             </tr>
//         }>
//         <tr>
//           <td>G$ {stakerInfo?.deposit}</td>
//           <td>G$ {stakerInfo?.earned}</td>
//           <td>G$ {stakerInfo?.lastSharePrice}</td>
//           <td>{stakerInfo?.shares}</td>
//         </tr>
//       </Table>
//     </div>   
//   )
// }
export {}