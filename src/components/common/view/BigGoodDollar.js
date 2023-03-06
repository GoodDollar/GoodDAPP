// @flow
import React from 'react'
import { decimalsToFixed } from '../../../lib/wallet/utils'
import { useFormatG$ } from '../../../lib/wallet/GoodWalletProvider'
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

const BigGoodDollar = ({ number, formatter, testID, chainId, ...props }: Props) => {
  const { toDecimals } = useFormatG$()
  const defaultFormat = number => decimalsToFixed(toDecimals(number, chainId))
  const numberFormatter = formatter || defaultFormat
  const formatted = number === undefined ? '-.--' : numberFormatter(number)

  return (
    <BigNumber number={formatted} {...props} testID={testID}>
      {!props.unit && <GDUnits {...props} />}
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
