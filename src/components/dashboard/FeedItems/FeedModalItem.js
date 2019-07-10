// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Avatar, BigGoodDollar, CustomButton, Text } from '../../common'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import ModalWrapper from '../../common/modal/ModalWrapper'
import type { FeedEventProps } from './EventProps'
import EventCounterParty from './EventCounterParty'

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = (props: FeedEventProps) => {
  const { item, onPress, styles } = props
  const buttonPress = () => {
    onPress(item.id)
  }

  return (
    <ModalWrapper onClose={buttonPress} showJaggedEdge={true}>
      <React.Fragment>
        {['send', 'empty'].indexOf(item.type) === -1 && (
          <Text style={styles.dateText}>{getFormattedDateTime(item.date)}</Text>
        )}
        {item.data && (
          <View style={[styles.row, styles.title]}>
            {item.data.endpoint && item.data.endpoint.title && (
              <Text style={styles.leftTitle}>{item.data.endpoint.title}</Text>
            )}
            <Text style={styles.leftTitle}>
              {item.type === 'send' ? 'Sent G$' : 'Received G$'}
              {item.type === 'send' && item.data.endpoint.withdrawStatus && (
                <Text> by link - {item.data.endpoint.withdrawStatus}</Text>
              )}
            </Text>
            <BigGoodDollar number={item.data.amount} elementStyles={styles.currency} />
          </View>
        )}
        {item.type === 'send' && (
          <Text style={[styles.dateText, styles.bottomDate]}>{getFormattedDateTime(item.date)}</Text>
        )}
        <View style={styles.hrLine} />
        <View style={styles.row}>
          <Avatar style={styles.avatarColor} source={item.data && item.data.endpoint && item.data.endpoint.avatar} />
          <Text style={styles.leftMargin}>{item.data && <EventCounterParty feedItem={item} />}</Text>
        </View>
        <View style={styles.hrLine} />
        {item.data && item.data.message ? <Text style={styles.reason}>{item.data.message}</Text> : null}
        <View style={styles.buttonsRow}>
          <CustomButton mode="contained" style={styles.rightButton} onPress={buttonPress}>
            OK
          </CustomButton>
        </View>
      </React.Fragment>
    </ModalWrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    horizItem: {
      alignSelf: 'flex-start', // Necessary for touch highlight
      flex: 1,
      marginRight: normalize(10),
      width: '95vw'
    },
    dateText: {
      color: '#A3A3A3',
      fontSize: normalize(10),
      fontWeight: '500'
    },
    bottomDate: {
      marginTop: normalize(5)
    },
    buttonsRow: {
      alignItems: 'flex-end',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    rightButton: {
      marginLeft: 'auto',
      minWidth: normalize(80)
    },
    row: {
      alignItems: 'center',
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingHorizontal: 0
    },
    title: {
      justifyContent: 'flex-end',
      paddingTop: '2em'
    },
    leftMargin: {
      marginLeft: normalize(10)
    },
    leftTitle: {
      color: '#555',
      flex: 1,
      fontSize: normalize(20),
      fontWeight: '700'
    },
    rightTitle: {
      fontSize: normalize(16),
      color: '#000',
      fontWeight: '700',
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
      fontWeight: '700'
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
  }
}

export default withStyles(getStylesFromProps)(FeedModalItem)
