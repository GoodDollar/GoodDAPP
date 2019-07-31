// @flow
import React from 'react'
import { Image, View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { Avatar, BigGoodDollar, CustomButton, Text } from '../../common'
import ModalWrapper from '../../common/modal/ModalWrapper'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import type { FeedEventProps } from './EventProps'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EventIcon from './EventIcon'

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = (props: FeedEventProps) => {
  const { item, onPress, styles, theme } = props
  const buttonPress = () => {
    onPress(item.id)
  }
  const itemType = item.type
  const mainColor = getEventSettingsByType(theme, itemType).color
  const getImageByType = type => {
    return (
      {
        claim: require('./img/receive.png'),
        receive: require('./img/receive.png'),
        send: require('./img/send.png'),
      }[type] || null
    )
  }

  return (
    <ModalWrapper leftBorderColor={mainColor} onClose={buttonPress} showJaggedEdge={true} fullHeight={true}>
      <React.Fragment>
        {getImageByType(itemType) ? (
          <View style={styles.mainImageContainer}>
            <Image style={styles.mainImage} source={getImageByType(itemType)} />
          </View>
        ) : null}
        <View style={styles.dateAndAmount}>
          <Text style={styles.date}>{getFormattedDateTime(item.date)}</Text>
          <BigGoodDollar
            bigNumberStyles={styles.bigNumberStyles}
            bigNumberUnitStyles={styles.bigNumberUnitStyles}
            color={mainColor}
            number={item.data.amount}
          />
        </View>
        <View style={[styles.transactionDetails, { borderColor: mainColor }]}>
          <Avatar source={item.data && item.data.endpoint && item.data.endpoint.avatar} style={styles.avatar} />
          {item.data && item.data.endpoint && <EventCounterParty style={styles.feedItem} feedItem={item} />}
          <EventIcon type={itemType} style={styles.icon} />
        </View>
        {item.data.message ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item.data.message}</Text>
          </View>
        ) : null}
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
    mainImageContainer: {
      display: 'flex',
      flexGrow: 0,
      flexShrink: 0,
      justifyContent: 'center',
      flexDirection: 'row',
      marginBottom: 15,
    },
    mainImage: {
      height: 110,
      width: 70,
    },
    dateAndAmount: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    feedItem: {
      paddingRight: 4,
    },
    date: {
      color: theme.colors.darkGray,
      fontSize: normalize(10),
    },
    bigNumberStyles: {
      fontSize: normalize(22),
      marginRight: 4,
    },
    bigNumberUnitStyles: {
      fontSize: normalize(12),
    },
    transactionDetails: {
      alignItems: 'center',
      borderBottomWidth: 2,
      borderTopWidth: 2,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 18,
      paddingBottom: 14,
      paddingTop: 14,
    },
    avatar: {
      backgroundColor: theme.colors.lightGray,
      borderRadius: '50%',
      height: 34,
      marginRight: 7,
      width: 34,
    },
    icon: {
      marginLeft: 'auto',
    },
    messageContainer: {
      flex: 1,
    },
    message: {
      color: theme.colors.darkGray,
      fontSize: normalize(14),
      textAlign: 'left',
    },
    buttonsRow: {
      alignItems: 'flex-end',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rightButton: {
      marginLeft: 'auto',
      minWidth: 80,
    },
  }
}

export default withStyles(getStylesFromProps)(FeedModalItem)
