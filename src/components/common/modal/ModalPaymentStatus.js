import React from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import Text from '../view/Text'
import { withStyles } from '../../../lib/styles'

const statusLabel = {
  sendpending: t`Payment Pending...`,
  sendcancelled: t`Payment Cancelled`,
}

const PaymentStatus = ({ item, styles }) =>
  item.displayType in statusLabel && (
    <View style={styles.titleStyle}>
      <Text color="primary" fontSize={22} fontWeight="medium">
        {statusLabel[item.displayType]}
      </Text>
    </View>
  )

const getStylesFromProps = ({ theme }) => ({
  titleStyle: {
    height: 110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default withStyles(getStylesFromProps)(PaymentStatus)
