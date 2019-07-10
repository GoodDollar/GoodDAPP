// @flow
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Avatar, BigGoodDollar, CustomButton } from '../../common'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import type { FeedEventProps } from './EventProps'
import EventCounterParty from './EventCounterParty'

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = ({ styles, item, onPress }: FeedEventProps) => (
  <View style={styles ? [customStyles.horizItem, styles] : customStyles.horizItem}>
    <View style={customStyles.fullHeight}>
      <View style={customStyles.modal}>
        {['send', 'empty'].indexOf(item.type) === -1 && (
          <Text style={customStyles.dateText}>{getFormattedDateTime(item.date)}</Text>
        )}
        {item.data && (
          <View style={[customStyles.row, customStyles.title]}>
            {item.data.endpoint && item.data.endpoint.title && (
              <Text style={customStyles.leftTitle}>{item.data.endpoint.title}</Text>
            )}
            <Text style={customStyles.leftTitle}>
              {item.type === 'send' ? 'Sent G$' : 'Received G$'}
              {item.type === 'send' && item.data.endpoint.withdrawStatus && (
                <Text> by link - {item.data.endpoint.withdrawStatus}</Text>
              )}
            </Text>
            <BigGoodDollar number={item.data.amount} elementStyles={customStyles.currency} />
          </View>
        )}
        {item.type === 'send' && (
          <Text style={[customStyles.dateText, customStyles.bottomDate]}>{getFormattedDateTime(item.date)}</Text>
        )}
        <View style={customStyles.hrLine} />
        <View style={customStyles.row}>
          <Avatar
            style={customStyles.avatarColor}
            source={item.data && item.data.endpoint && item.data.endpoint.avatar}
          />
          <Text style={customStyles.leftMargin}>{item.data && <EventCounterParty feedItem={item} />}</Text>
        </View>
        <View style={customStyles.hrLine} />
        {item.data && item.data.message ? <Text style={customStyles.reason}>{item.data.message}</Text> : null}
        <View style={customStyles.buttonsRow}>
          <CustomButton mode="contained" style={customStyles.rightButton} onPress={() => onPress(item.id)}>
            OK
          </CustomButton>
        </View>
      </View>
    </View>
  </View>
)

const customStyles = StyleSheet.create({
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
