import React from 'react'
import { View } from 'react-native'
import Text from '../view/Text'

const statusLabel = {
  sendpending: 'Payment Pending...',
  sendcancelled: 'Payment Cancelled',
  sendcompleted: 'Payment Completed!',
}

const PaymentStatus = ({ item }) =>
  item.displayType in statusLabel && (
    <View style={{ marginVertical: '10vh' }}>
      <Text color="primary" fontSize={22} fontWeight="500">
        {statusLabel[item.displayType]}
      </Text>
    </View>
  )

export default PaymentStatus
