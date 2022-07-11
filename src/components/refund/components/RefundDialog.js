// @flow
import React, { useMemo } from 'react'
import { View } from 'react-native'

import moment from 'moment'
import { withStyles } from '../../../lib/styles'
import Text from '../../common/view/Text'
import AlertOctagon from '../../../assets/alertOctagon.svg'
import { openLink } from '../../../lib/utils/linking'
import Config from '../../../config/config'
import { weiToMask } from '../../../lib/wallet/utils'

export type DialogButtonProps = { color?: string, mode?: string, onPress?: Function => void, text: string, style?: any }
export type DialogProps = {
  message?: string,
  onReturn?: () => void,
  visible?: boolean,
  buttons?: DialogButtonProps[],
}

const onReadMorePress = () => openLink(Config.refundInfoLink)

const RefundDialog = ({ theme, styles, amount, onReturn }) => {
  const currentDate = useMemo(() => moment().format('MM/DD/YY | hh:mma Z'), [])
  const formattedAmount = useMemo(() => (amount ? weiToMask(amount) : 0), [amount])

  return (
    <View style={styles.container}>
      <AlertOctagon width={80} height={80} />

      <Text fontFamily={theme.fonts.roboto} fontSize={14} fontWeight="thin" style={styles.date}>
        {currentDate}
      </Text>

      <Text fontFamily={theme.fonts.roboto} fontSize={20} fontWeight="bold">
        Please return the
      </Text>

      <Text fontFamily={theme.fonts.roboto} fontSize={28} fontWeight="bold">
        {formattedAmount} G$
      </Text>

      <Text fontFamily={theme.fonts.roboto} fontSize={20} fontWeight="bold" style={styles.bottomTitle}>
        {`you've claimed.`}
      </Text>

      <Text fontFamily={theme.fonts.roboto} fontSize={18} fontWeight="bold" style={styles.topDescription}>
        {`The community is depending on you!`}
      </Text>

      <Text fontFamily={theme.fonts.roboto} fontSize={18} fontWeight="thin" style={styles.description}>
        {`Fair distribution of G$ UBI is critical to creating a more equal GoodDollar. We're asking everyone to voluntarily return the amount they've received for the good of empowering others.`}
      </Text>

      <Text
        onPress={onReadMorePress}
        color={'#54698B'}
        fontFamily={theme.fonts.roboto}
        fontSize={18}
        fontWeight="thin"
        style={styles.link}
      >
        Read more
      </Text>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  container: {
    flexGrow: 1,
    alignItems: 'flex-start',
    paddingTop: theme.sizes.default,
  },
  date: { marginVertical: theme.sizes.default },
  bottomTitle: { marginBottom: theme.sizes.defaultDouble },
  topDescription: {
    marginBottom: theme.sizes.default,
  },
  description: {
    textAlign: 'left',
    marginBottom: theme.sizes.default,
  },
  link: {
    textDecorationLine: 'underline',
    marginBottom: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(RefundDialog)
