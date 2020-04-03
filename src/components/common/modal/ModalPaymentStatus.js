import React from 'react'
import { View } from 'react-native'
import Text from '../view/Text'
import { withStyles } from '../../../lib/styles'

const statusLabel = {
  sendpending: 'Payment Pending...',
  sendcancelled: 'Payment Cancelled',
  sendcompleted: 'Payment Completed!',
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
