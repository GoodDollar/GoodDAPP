// @flow
import React from 'react'
import { View, Platform } from 'react-native'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import Text from '../../common/view/Text'
import ModalWrapper from '../../common/modal/ModalWrapper'
import ModalActionsByFeedType from '../../common/modal/ModalActionsByFeedType'
import ModalPaymentStatus from '../../common/modal/ModalPaymentStatus'
import TopImage from '../../common/modal/ModalTopImage'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import type { FeedEventProps } from './EventProps'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EventIcon from './EventIcon'
import FeedbackModalItem from './FeedbackModalItem'
import SendModalItemWithError from './SendModalItemWithError'

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = (props: FeedEventProps) => {
  const { item, onPress, styles, theme, navigation } = props
  const buttonPress = () => {
    onPress(item.id)
  }
  const itemType = item.displayType || item.type
  const eventSettings = getEventSettingsByType(theme, itemType)
  const mainColor = eventSettings.color
  const showJaggedEdge = ['claim', 'sendcompleted', 'withdraw', 'receive'].includes(itemType)

  return (
    <ModalWrapper
      leftBorderColor={mainColor}
      itemType={itemType}
      onClose={buttonPress}
      showJaggedEdge={showJaggedEdge}
      fullHeight
    >
      {item.type === 'feedback' ? (
        <FeedbackModalItem {...props} />
      ) : ['senderror', 'withdrawerror'].includes(itemType) ? (
        <SendModalItemWithError {...props} />
      ) : (
        <React.Fragment>
          <TopImage type={itemType} />
          <ModalPaymentStatus item={item} />
          <View style={styles.dateAndAmount}>
            <React.Fragment>
              <Text fontSize={10}>{getFormattedDateTime(item.date)}</Text>
              {!eventSettings.withoutAmount && (
                <React.Fragment>
                  {eventSettings && eventSettings.actionSymbol && (
                    <Text fontWeight="bold" fontSize={22} color={mainColor} style={styles.actionSymbol}>
                      {eventSettings.actionSymbol}
                    </Text>
                  )}
                  <BigGoodDollar
                    number={item.data.amount}
                    color={mainColor}
                    bigNumberProps={{ fontSize: 22 }}
                    bigNumberStyles={styles.bigNumberStyles}
                    bigNumberUnitProps={{ fontSize: 12 }}
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          </View>
          <View style={[styles.transactionDetails, { borderColor: mainColor }]}>
            {!eventSettings.withoutAvatar && (
              <Avatar
                source={item.data && item.data.endpoint && item.data.endpoint.avatar}
                size={34}
                style={styles.avatar}
              />
            )}
            {item.data && item.data.endpoint && <EventCounterParty style={styles.feedItem} feedItem={item} />}
            {!eventSettings.withoutAvatar && <EventIcon type={itemType} style={styles.icon} />}
          </View>
          <View style={styles.messageContainer}>
            <Text fontSize={14} textAlign="left">
              {item.data.message || ''}
            </Text>
          </View>
          {item.status === 'pending' && (
            <View style={styles.messageContainer}>
              <Text fontSize={14} color="gray50Percent">
                Your balance will be updated in a minute
              </Text>
            </View>
          )}
          <ModalActionsByFeedType item={item} navigation={navigation} handleModalClose={buttonPress} />
        </React.Fragment>
      )}
    </ModalWrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
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
    bigNumberStyles: {
      marginRight: 4,
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
      borderRadius: Platform.select({
        web: '50%',
        default: 34 / 2,
      }),
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
    buttonsRow: {
      alignItems: 'flex-end',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.sizes.defaultDouble,
    },
    actionSymbol: {
      marginLeft: 'auto',
    },
  }
}

export default withStyles(getStylesFromProps)(FeedModalItem)
