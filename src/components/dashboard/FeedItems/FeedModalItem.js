// @flow
import React, { useCallback } from 'react'
import { View } from 'react-native'
import { get, isNil } from 'lodash'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import Text from '../../common/view/Text'
import ModalWrapper from '../../common/modal/ModalWrapper'
import ModalActionsByFeedType from '../../common/modal/ModalActionsByFeedType'
import ModalPaymentStatus from '../../common/modal/ModalPaymentStatus'
import TopImage, { getImageByType } from '../../common/modal/ModalTopImage'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import useProfile from '../../../lib/userStorage/useProfile'
import type { FeedEventProps } from './EventProps'
import EventCounterParty, { EventSelfParty } from './EventCounterParty'
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
  const { avatar: selfAvatar, email } = useProfile()

  const itemType = item.displayType || item.type

  const eventSettings = getEventSettingsByType(theme, itemType)
  const mainColor = eventSettings.color
  const showJaggedEdge = ['claim', 'sendcompleted', 'withdraw', 'receive'].includes(itemType)
  const topImageExists = !!getImageByType(itemType)
  const avatar = get(item, 'data.endpoint.avatar')
  const sellerWebsite = get(item, 'data.sellerWebsite', '')
  const chainId = item.chainId || '122'

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
            <Text fontSize={10}>{getFormattedDateTime(item.date)}</Text>
            {!eventSettings.withoutAmount && (
              <React.Fragment>
                {eventSettings && eventSettings.actionSymbol && (
                  <Text fontWeight="bold" fontSize={22} color={mainColor} style={styles.actionSymbol}>
                    {eventSettings.actionSymbol}
                  </Text>
                )}
                <BigGoodDollar
                  number={get(item, 'data.amount', 0)}
                  chainId={chainId}
                  color={mainColor}
                  bigNumberProps={{ fontSize: 24, lineHeight: 30 }}
                  bigNumberStyles={styles.bigNumberStyles}
                  bigNumberUnitProps={{ fontSize: 12 }}
                />
              </React.Fragment>
            )}
          </View>
          {eventSettings.withoutAvatar ? (
            <View style={[styles.transactionDetails, { borderColor: mainColor }]}>
              {item.data && item.data.endpoint && (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                  }}
                >
                  <EventCounterParty style={styles.feedItem} textStyle={styles.feedItemText} feedItem={item} />
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.transactionDetails, { borderColor: mainColor }]}>
              <Avatar source={avatar} size={34} imageSize={36} style={styles.avatar} />
              {item.data && item.data.endpoint && (
                <View style={{ flex: 1, alignItems: 'flex-start', flexDirection: 'column' }}>
                  <EventCounterParty style={styles.feedItem} textStyle={styles.feedItemText} feedItem={item} />
                  {!eventSettings.withoutAvatar && !!sellerWebsite && <EventInfoText>{sellerWebsite}</EventInfoText>}
                </View>
              )}
              <View style={styles.iconContainer}>
                <EventIcon type={itemType} showAnim={!topImageExists} />
              </View>
            </View>
          )}
          <View style={[styles.transactionDetails, { borderTopWidth: 0, borderBottomWidth: 0 }]}>
            {!eventSettings.withoutAvatar && (
              <Avatar source={selfAvatar} size={34} imageSize={36} style={styles.avatar} />
            )}
            {item.data && item.data.endpoint && (
              <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <EventSelfParty style={styles.feedItem} textStyle={styles.feedItemText} feedItem={item} />
                <EventInfoText>{email}</EventInfoText>
              </View>
            )}
          </View>
          <View style={styles.messageContainer}>
            {!!get(item, 'data.preMessageText') && (
              <Text fontSize={14} textAlign="left" lineHeight={20} letterSpacing={0.14} fontWeight="bold">
                {item.data.preMessageText}
                {'\n\n'}
              </Text>
            )}
            <Text fontSize={14} textAlign="left">
              {get(item, 'data.message', '')}
            </Text>
          </View>
          {get(item, 'data.invoiceId', false) && (
            <Text
              fontSize={12}
              color={theme.colors.gray50Percent}
              textAlign="left"
              lineHeight={20}
              letterSpacing={0.14}
            >
              Invoice Number {item.data.invoiceId}
            </Text>
          )}
          {isNil(get(item, 'data.receiptHash')) && item.status === 'pending' && (
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

const getFeedTextStyles = () => ({
  message: {
    paddingBottom: 0,
    flexShrink: 0,
  },
})

const EventInfoText = withStyles(getFeedTextStyles)(({ theme, styles, isSmallDevice, children }) => (
  <Text lineHeight={20} numberOfLines={1} color={theme.colors.text} fontSize={10} style={styles.message}>
    {children}
  </Text>
))

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
      lineHeight: 30,
    },
  }
}

export default withStyles(getStylesFromProps)(FeedModalItem)
