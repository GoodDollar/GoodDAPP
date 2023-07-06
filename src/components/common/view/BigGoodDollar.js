// @flow
import React from 'react'
import { trimEnd } from 'lodash'
import { decimalsToFixed, isNativeToken } from '../../../lib/wallet/utils'
import { useFormatToken } from '../../../lib/wallet/GoodWalletProvider'
import Section from '../layout/Section'
import { theme } from '../../theme/styles'
import BigNumber from './BigNumber'
import Text from './Text'

type Props = { number: any, props?: {} }

const GOOD_SIGN_SIZE = 18

// const DIFF_FACTOR = 0.5
// const DOLLAR_SIGN_SIZE = GOOD_SIGN_SIZE - DIFF_FACTOR

/**
 * Receives wei and shows as G$ using BigNumber component
 * @param {Props} params
 * @param {Number} params.number
 * @returns {React.Node}
 */

const BigGoodDollar = ({ number, formatter, testID, chainId, unit, ...props }: Props) => {
  const { toDecimals } = useFormatToken(unit ?? 'G$')
  const asDecimals = number => toDecimals(number, chainId)

  const defaultFormat = isNativeToken(unit)
    ? number => trimEnd(decimalsToFixed(asDecimals(number), 18), '0')
    : number => decimalsToFixed(asDecimals(number))

  const numberFormatter = formatter || defaultFormat
  const formatted = number === undefined ? '-.--' : numberFormatter(number)

  return (
    <BigNumber number={formatted} unit={unit} {...props} testID={testID}>
      {!unit && <GDUnits {...props} />}
    </BigNumber>
  )
}

const GDUnits = props => {
  const { fontSize, ...bigNumberUnitProps } = props.bigNumberUnitProps || {}
  const goodSignFontSize = fontSize || GOOD_SIGN_SIZE
  const dollarSignFontSize = fontSize || GOOD_SIGN_SIZE

  return (
    <Section.Row style={props.bigNumberUnitStyles}>
      <Text
        color={props.color || 'gray'}
        fontSize={goodSignFontSize}
        fontFamily={theme.fonts.slab}
        fontWeight="bold"
        textAlign="right"
        lineHeight={props.lineHeight || 22}
        {...bigNumberUnitProps}
      >
        G
      </Text>
      <Text
        color={props.color || 'gray'}
        fontSize={dollarSignFontSize}
        fontFamily={theme.fonts.slab}
        fontWeight="bold"
        textAlign="right"
        lineHeight={props.lineHeight || 22}
        {...bigNumberUnitProps}
      >
        $
      </Text>
    </Section.Row>
  )
}

export default BigGoodDollar
