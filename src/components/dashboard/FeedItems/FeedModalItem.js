// @flow
import React from 'react'
import { View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import Text from '../../common/view/Text'
import ModalWrapper from '../../common/modal/ModalWrapper'
import ModalActionsByFeedType from '../../common/modal/ModalActionsByFeedType'
import TopImage from '../../common/modal/ModalTopImage'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import type { FeedEventProps } from './EventProps'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EventIcon from './EventIcon'
import FeedbackModalItem from './FeedbackModalItem'

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
  const itemType = item.displayType || item.type
  const eventSettings = getEventSettingsByType(theme, itemType)
  const mainColor = eventSettings.color
  const showJaggedEdge = ['claim', 'sendcompleted', 'withdraw', 'receive'].includes(itemType)

  return (
    <ModalWrapper leftBorderColor={mainColor} onClose={buttonPress} showJaggedEdge={showJaggedEdge} fullHeight={true}>
      {item.type === 'feedback' ? (
        <FeedbackModalItem {...props} />
      ) : (
        <React.Fragment>
          <TopImage type={itemType} />
          <View style={styles.dateAndAmount}>
            <React.Fragment>
              <Text style={styles.date}>{getFormattedDateTime(item.date)}</Text>
              {!eventSettings.withoutAmount && (
                <React.Fragment>
                  {eventSettings && eventSettings.actionSymbol && (
                    <Text style={[styles.actionSymbol, { color: mainColor }]}>{eventSettings.actionSymbol}</Text>
                  )}
                  <BigGoodDollar
                    bigNumberStyles={styles.bigNumberStyles}
                    bigNumberUnitStyles={styles.bigNumberUnitStyles}
                    color={mainColor}
                    number={item.data.amount}
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
          {item.data.message && (
            <View style={styles.messageContainer}>
              <Text color="darkGray" fontSize={14} textAlign="left">
                {item.data.message}
              </Text>
            </View>
          )}
          {item.status === 'pending' && (
            <View style={styles.messageContainer}>
              <Text fontSize={14} fontFamily="regular" color="placeholder">
                Your balance will be updated in a minute
              </Text>
            </View>
          )}
          <ModalActionsByFeedType item={item} handleModalClose={buttonPress} />
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
    buttonsRow: {
      alignItems: 'flex-end',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.sizes.defaultDouble,
    },
    actionSymbol: {
      fontFamily: theme.fonts.default,
      fontSize: normalize(22),
      fontWeight: '700',
      marginLeft: 'auto',
    },
  }
}

export default withStyles(getStylesFromProps)(FeedModalItem)
