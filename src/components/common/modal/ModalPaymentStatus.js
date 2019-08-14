import React from 'react'
import { StyleSheet, View } from 'react-native'
import Text from '../view/Text'

const statusLabel = {
  sendpending: 'Payment Pending...',
  sendcancelled: 'Payment Cancelled',
  sendcompleted: 'Payment Completed!',
}

const PaymentStatus = ({ item }) =>
  item.displayType in statusLabel && (
    <View style={styles.titleStyle}>
      <Text color="primary" fontSize={22} fontWeight="500">
        {statusLabel[item.displayType]}
      </Text>
    </View>
  )

const styles = StyleSheet.create({
  titleStyle: {
    height: 110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default PaymentStatus
