// @flow
import React from 'react'
import { weiToMask } from '../../../lib/wallet/utils'
import BigNumber from './BigNumber'
import Text from './Text'

type Props = { number: any, props?: {} }

const GOOD_SIGN_SIZE = 18
const DIFF_FACTOR = 0.5
const DOLLAR_SIGN_SIZE = GOOD_SIGN_SIZE - DIFF_FACTOR

/**
 * Receives wei and shows as G$ using BigNumber component
 * @param {Props} params
 * @param {Number} params.number
 * @returns {React.Node}
 */
const BigGoodDollar = ({ number, formatter, ...props }: Props) => {
  const numberFormatter = formatter || weiToMask
  number = number === undefined ? '-.--' : numberFormatter(number)

  return (
    <BigNumber number={number} {...props}>
      {props.unit ? null : <GDUnits {...props} />}
    </BigNumber>
  )
}

const GDUnits = props => {
  const { fontSize, ...bigNumberUnitProps } = props.bigNumberUnitProps || {}
  const goodSignFontSize = fontSize || GOOD_SIGN_SIZE
  const dollarSignFontSize = fontSize ? fontSize - DIFF_FACTOR : DOLLAR_SIGN_SIZE

  return (
    <Text style={props.bigNumberUnitStyles}>
      <Text
        color={props.color || 'gray'}
        fontSize={goodSignFontSize}
        fontFamily="slab"
        fontWeight="bold"
        textAlign="right"
        {...bigNumberUnitProps}
      >
        G
      </Text>
      <Text
        color={props.color || 'gray'}
        fontSize={dollarSignFontSize}
        fontFamily="slab"
        fontWeight="bold"
        textAlign="right"
        {...bigNumberUnitProps}
      >
        $
      </Text>
    </Text>
  )
}

export default BigGoodDollar
