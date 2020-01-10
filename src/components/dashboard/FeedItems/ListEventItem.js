// @flow
import React from 'react'
import { isMobile } from 'mobile-device-detect'
import { View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import { getScreenWidth } from '../../../lib/utils/Orientation'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import Text from '../../common/view/Text'
import type { FeedEventProps } from './EventProps'
import EventIcon from './EventIcon'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EmptyEventFeed from './EmptyEventFeed'

/**
 * Render list withdraw item for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ListEvent = ({ item: feed, theme, styles }: FeedEventProps) => {
  const itemType = feed.displayType || feed.type
  const eventSettings = getEventSettingsByType(theme, itemType)
  const mainColor = eventSettings.color
  const isSmallDevice = isMobile && getScreenWidth() < 353
  const isFeedTypeClaiming = feed.type === 'claiming'
  const isErrorCard = ['senderror', 'withdrawerror'].includes(itemType)

  if (itemType === 'empty') {
    return <EmptyEventFeed />
  }

  return (
    <View style={styles.innerRow}>
      <View style={styles.emptySpace} />
      <View grow style={styles.mainContents}>
        <View style={[styles.dateAndValue, { borderBottomColor: mainColor }]}>
          <Text fontSize={10} color="gray80Percent" lineHeight={17}>
            {getFormattedDateTime(feed.date)}
          </Text>
          {!eventSettings.withoutAmount && (
            <React.Fragment>
              {eventSettings && eventSettings.actionSymbol && (
                <Text fontSize={15} lineHeight={18} fontWeight="bold" color={mainColor} style={styles.actionSymbol}>
                  {eventSettings.actionSymbol}
                </Text>
              )}
              <BigGoodDollar
                number={feed.data.amount}
                color={mainColor}
                bigNumberProps={{ fontSize: 15, lineHeight: 18 }}
                bigNumberStyles={styles.bigNumberStyles}
                bigNumberUnitProps={{ fontSize: 10, lineHeight: 11 }}
                bigNumberUnitStyles={styles.bigNumberUnitStyles}
              />
            </React.Fragment>
          )}
        </View>
        <View style={styles.transferInfo} alignItems="flex-start">
          <Avatar
            size={normalize(34)}
            style={styles.avatarBottom}
            source={feed.data && feed.data.endpoint && feed.data.endpoint.avatar}
          />
          <View style={[styles.mainInfo, isFeedTypeClaiming && styles.claimingCardFeedText]}>
            {isErrorCard ? (
              <>
                <Text fontWeight="medium" lineHeight={19} style={styles.mainText} color="primary">
                  {`We're sorry.`}
                </Text>
                <ReadMoreText
                  text="This transaction failed"
                  buttonText="Read why..."
                  style={styles.failTransaction}
                  color="primary"
                />
              </>
            ) : (
              <>
                <EventCounterParty
                  style={styles.feedItem}
                  feedItem={feed}
                  subtitle={true}
                  isSmallDevice={isSmallDevice}
                />
                <FeedText feed={feed} isSmallDevice={isSmallDevice} />
              </>
            )}
          </View>
          <EventIcon style={styles.typeIcon} type={itemType} size={normalize(34)} />
        </View>
      </View>
    </View>
  )
}

const getWelcomeStyles = ({ theme }) => ({
  readMoreText: {
    letterSpacing: 0,
    marginLeft: 4,
  },
  readMore: {
    minHeight: normalize(16),
    maxHeight: normalize(16),
    marginHorizontal: -theme.sizes.default,
    // display: 'inline',
  },
  welcomeText: {
    textAlign: 'left',
  },
})

const ReadMoreText = withStyles(getWelcomeStyles)(({ styles, theme, text, buttonText, style, color }) => (
  <Text style={styles.welcomeText}>
    <Text fontWeight="medium" numberOfLines={1} style={style} color={color || 'darkGray'}>
      {text}
    </Text>
    <Text color={color || theme.colors.lighterGray} numberOfLines={1} fontSize={10} style={styles.readMoreText}>
      {buttonText}
    </Text>
  </Text>
))

const getFeedTextStyles = ({ theme }) => ({
  message: {
    paddingBottom: 0,
    flexShrink: 0,
  },
})

const FeedText = withStyles(getFeedTextStyles)(({ styles, feed, isSmallDevice }) => {
  let result = ''

  switch (feed.type) {
    case 'welcome':
      result = <ReadMoreText text="Start claiming free G$" buttonText="Read more..." />
      break

    case 'invite':
      result = <ReadMoreText text="Invite more friends!" buttonText="Read more..." />
      break

    case 'backup':
      result = <ReadMoreText text="wallet pass phrase" buttonText="Read more..." />
      break

    case 'spending':
      result = <ReadMoreText text="here >>>" buttonText="Read more..." />
      break

    case 'claiming':
      result = isSmallDevice ? <ReadMoreText text="daily G$" /> : ''
      break

    case 'hanukaStarts':
      result = <ReadMoreText text="Claim today for extra G$$$" />
      break

    default:
      result = (
        <Text numberOfLines={1} color="gray80Percent" fontSize={10} textTransform="capitalize" style={styles.message}>
          {feed.data.message}
        </Text>
      )
      break
  }

  return result
})

const getStylesFromProps = ({ theme }) => ({
  innerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'center',
    maxHeight: '100%',
    padding: theme.sizes.default,
    width: '100%',
  },
  avatarBottom: {
    position: 'absolute',
    left: -normalize(41),
    marginTop: theme.sizes.default,
    alignSelf: 'flex-start',
  },
  mainContents: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: theme.sizes.default,
  },
  dateAndValue: {
    alignItems: 'center',
    // borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'space-between',
    paddingBottom: theme.sizes.default - 2,
  },
  actionSymbol: {
    marginLeft: 'auto',
  },
  bigNumberStyles: {
    marginRight: theme.sizes.defaultHalf,
  },
  bigNumberUnitStyles: {
    lineHeight: normalize(16),
  },
  transferInfo: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    height: normalize(45),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  emptySpace: {
    width: normalize(34),
  },
  claimingCardFeedText: {
    height: '100%',
    justifyContent: 'center',
  },
  mainInfo: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-end',
    marginBottom: 0,
    marginRight: theme.sizes.default,
    marginTop: 0,
  },
  feedItem: {
    flexShrink: 0,
    height: normalize(20),
    marginTop: theme.sizes.default - 2,
    display: 'flex',
    alignItems: 'flex-end',
  },
  typeIcon: {
    marginTop: theme.sizes.default,
    alignSelf: 'flex-start',
  },
  failTransaction: {
    paddingBottom: 'inherit',
  },
  mainText: {
    textAlignVertical: 'middle',
    paddingTop: 5,
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
