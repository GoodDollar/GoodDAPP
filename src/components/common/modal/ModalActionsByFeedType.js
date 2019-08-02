// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const ModalActionsByFeedType = ({ theme, styles, item }) => {
  return <View style={styles.buttonsView} />

  // switch (item.type) {
  //   case 'claim':
  //     break
  //   case 'send':
  //     break
  //   case 'receive':
  //     break
  //   case 'withdraw':
  //     break
  //   case 'message':
  //     break
  //   case 'notification':
  //     break
  //   case 'invite':
  //     break
  //   case 'feedback':
  //     break
  //   case 'empty':
  //     break
  //   default:
  //     break
  // }
}

const getStylesFromProps = ({ theme }) => ({
  buttonsView: {
    display: 'flex',
  },
})

export default withStyles(getStylesFromProps)(ModalActionsByFeedType)
