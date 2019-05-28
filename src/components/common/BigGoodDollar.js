// @flow
import React from 'react'
import BigNumber from './BigNumber'
import { weiToMask } from '../../lib/wallet/utils'

type Props = { number: any, props?: {} }

/**
 * Receives wei and shows as G$ using BigNumber component
 * @param {Props} props
 * @param {Number} [props.number]
 * @returns {React.Node}
 */
const BigGoodDollar = ({ number, ...props }: Props) => <BigNumber number={weiToMask(number)} unit={'G$'} {...props} />

export default BigGoodDollar
