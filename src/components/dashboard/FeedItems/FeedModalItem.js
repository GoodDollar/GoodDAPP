// @flow
import React, { useCallback } from 'react'
import { View } from 'react-native'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import Text from '../../common/view/Text'
import ModalWrapper from '../../common/modal/ModalWrapper'
import ModalActionsByFeedType from '../../common/modal/ModalActionsByFeedType'
import ModalPaymentStatus from '../../common/modal/ModalPaymentStatus'
import TopImage, { getImageByType } from '../../common/modal/ModalTopImage'
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
  const buttonPress = useCallback(() => onPress(item.id), [item, onPress])
  const itemType = item.displayType || item.type
  const eventSettings = getEventSettingsByType(theme, itemType)
  const mainColor = eventSettings.color
  const showJaggedEdge = ['claim', 'sendcompleted', 'withdraw', 'receive'].includes(itemType)
  const topImageExists = !!getImageByType(itemType)

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
                    bigNumberProps={{ fontSize: 24 }}
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
                imageSize={36}
                style={styles.avatar}
              />
            )}
            {item.data && item.data.endpoint && (
              <EventCounterParty style={styles.feedItem} textStyle={styles.feedItemText} feedItem={item} />
            )}
            {!eventSettings.withoutAvatar && (
              <View style={styles.iconContainer}>
                <EventIcon type={itemType} showAnim={!topImageExists} />
              </View>
            )}
          </View>
          <View style={styles.messageContainer}>
            {!!item.data.preMessageText && (
              <Text fontSize={14} textAlign="left" lineHeight={20} letterSpacing={0.14} fontWeight="bold">
                {item.data.preMessageText}
                {'\n\n'}
              </Text>
            )}
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
      alignItems: 'baseline',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    feedItem: {
      paddingRight: theme.sizes.defaultHalf,
      marginRight: 'auto',
      display: 'flex',
      alignItems: 'baseline',
      height: 'auto',
    },
    feedItemText: {
      fontSize: 22,
      lineHeight: 22,
    },
    bigNumberStyles: {
      marginRight: theme.sizes.defaultHalf,
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
      marginRight: 7,
    },
    iconContainer: {
      height: 36,
      width: 36,
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
