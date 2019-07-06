// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Avatar } from 'react-native-paper'
import { View } from 'react-native-web'
import { BigGoodDollar, CustomButton, Text } from '../../common'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import type { FeedEventProps } from './EventProps'

/**
 * Render modal send item for feed list in horizontal view
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ModalSendEvent = ({ item: feed, onPress }: FeedEventProps) => {
  return (
    <View style={styles.modal}>
      <View style={styles.row}>
        {feed.data.endpoint.title && <Text style={styles.leftTitle}>{feed.data.endpoint.title}</Text>}
        <Text style={styles.leftTitle}>
          Sent G$
          {feed.data.endpoint.withdrawStatus && <Text> by link - {feed.data.endpoint.withdrawStatus}</Text>}
        </Text>
        <BigGoodDollar number={feed.data.amount} elementStyles={styles.currency} />
      </View>
      <Text>{getFormattedDateTime(feed.date)}</Text>
      <View style={styles.hrLine} />
      <View style={styles.row}>
        <Avatar.Image size={48} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
        <Text style={styles.leftMargin}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.name}>{feed.data.endpoint.fullName}</Text>
        </Text>
      </View>
      <View style={styles.hrLine} />
      {feed.data.message && <Text>{feed.data.message}</Text>}
      <View style={styles.buttonsRow}>
        <CustomButton mode="contained" style={styles.rightButton} onPress={() => onPress(feed.id)}>
          OK
        </CustomButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: normalize(4),
    borderLeftWidth: normalize(10),
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: normalize(30),
    borderColor: '#c9c8c9'
  },
  buttonsRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  rightButton: {
    marginLeft: 'auto',
    minWidth: normalize(80)
  },
  leftMargin: {
    marginLeft: 'auto'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    padding: 0
  },
  leftTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    flex: 1
  },
  rightTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  },
  label: {
    fontSize: normalize(10),
    color: 'black',
    display: 'inlineBlock'
  },
  name: {
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  },
  currency: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  }
})

export default ModalSendEvent
