// @flow
import React from 'react'
import { weiToMask } from '../../lib/wallet/utils'
import BigNumber from './BigNumber'

type Props = { number: any, props?: {} }

/**
 * Receives wei and shows as G$ using BigNumber component
 * @param {Props} props
 * @param {Number} [props.number]
 * @returns {React.Node}
 */
const BigGoodDollar = ({ number, ...props }: Props) => (
  <BigNumber number={number !== undefined ? weiToMask(number) : '-.--'} unit={'G$'} {...props} />
)

export default BigGoodDollar
