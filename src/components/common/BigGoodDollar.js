// @flow
import React from 'react'
import BigNumber from './BigNumber'
import { weiToMask } from '../../lib/wallet/utils'

export default ({ number, ...props }: { number: any, props: any }) => (
  <BigNumber number={weiToMask(number)} unit={'GD'} {...props} />
)
