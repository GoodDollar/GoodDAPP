// @flow
import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import type { FeedEventProps } from './EventProps'
import EventCounterParty from './EventCounterParty'
import { CustomButton, BigGoodDollar, Avatar } from '../../common'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = (props: FeedEventProps) => (
  <View style={props.styles ? [styles.horizItem, props.styles] : styles.horizItem}>
    <View style={styles.fullHeight}>
      <View style={styles.modal}>
        {props.item.type !== 'send' && <Text style={styles.dateText}>{getFormattedDateTime(props.item.date)}</Text>}
        <View style={[styles.row, styles.title]}>
          {props.item.data.endpoint.title && <Text style={styles.leftTitle}>{props.item.data.endpoint.title}</Text>}
          <Text style={styles.leftTitle}>
            {props.item.type !== 'send' ? 'Received G$' : 'Sent G$'}
            {props.item.type === 'send' && props.item.data.endpoint.withdrawStatus && (
              <Text> by link - {props.item.data.endpoint.withdrawStatus}</Text>
            )}
          </Text>
          <BigGoodDollar number={props.item.data.amount} elementStyles={styles.currency} />
        </View>
        {props.item.type === 'send' && (
          <Text style={[styles.dateText, styles.bottomDate]}>{getFormattedDateTime(props.item.date)}</Text>
        )}
        <View style={styles.hrLine} />
        <View style={styles.row}>
          <Avatar style={styles.avatarColor} source={props.item.data.endpoint.avatar} />
          <Text style={styles.leftMargin}>
            <EventCounterParty feedItem={props.item} />
          </Text>
        </View>
        <View style={styles.hrLine} />
        {props.item.data.message && <Text style={styles.reason}>{props.item.data.message}</Text>}
        <View style={styles.buttonsRow}>
          <CustomButton mode="contained" style={styles.rightButton} onPress={() => props.onPress(props.item.id)}>
            OK
          </CustomButton>
        </View>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  horizItem: {
    flex: 1,
    alignSelf: 'flex-start', // Necessary for touch highlight
    width: '95vw',
    marginRight: normalize(10)
  },
  fullHeight: {
    height: '100%',
    flex: 1
  },
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
  dateText: {
    fontSize: normalize(10),
    color: '#A3A3A3',
    fontWeight: '500'
  },
  bottomDate: {
    marginTop: normalize(5)
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 0
  },
  title: {
    paddingTop: '2em',
    justifyContent: 'flex-end'
  },
  leftMargin: {
    marginLeft: normalize(10)
  },
  leftTitle: {
    color: '#555',
    flex: 1,
    fontWeight: '700',
    fontSize: normalize(20)
  },
  rightTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  },
  currency: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  },
  reason: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontSize: normalize(16),
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  avatarColor: {
    backgroundColor: '#BBB',
    borderRadius: '50%'
  }
})

export default FeedModalItem
