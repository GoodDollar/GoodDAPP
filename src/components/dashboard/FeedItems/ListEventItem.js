// @flow
import React from 'react'
import { Linking, Platform, Pressable, View } from 'react-native'
import { get } from 'lodash'
import { t } from '@lingui/macro'
import { isMobile } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import { getScreenWidth } from '../../../lib/utils/orientation'
import { getDesignRelativeWidth } from '../../../lib/utils/sizes'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import { Icon, Image, Section, SvgXml, Text } from '../../common'
import useOnPress from '../../../lib/hooks/useOnPress'
import logger from '../../../lib/logger/js-logger'
import { fireEvent, GOTO_SPONSOR } from '../../../lib/analytics/analytics'
import type { FeedEventProps } from './EventProps'
import EventIcon from './EventIcon'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EmptyEventFeed from './EmptyEventFeed'
import FeedListItemLeftBorder from './FeedListItemLeftBorder'

const log = logger.child({ from: 'ListEventItem' })

const InviteItem = ({ item, theme }) => (
  <Section.Row style={{ flex: 1, paddingVertical: theme.sizes.default * 1.5 }}>
    <Section.Stack>
      <Icon color={theme.colors.white} name="invite" size={30} />
    </Section.Stack>
    <Section.Stack style={{ marginLeft: getDesignRelativeWidth(theme.sizes.default) }}>
      <Text
        color={theme.colors.white}
        textAlign="left"
        fontSize={18}
        lineHeight={18}
        fontWeight="bold"
        letterSpacing={0.09}
      >
        {get(item, 'data.subtitle', '')}
      </Text>
      <Text
        color={theme.colors.white}
        textAlign="left"
        fontSize={13}
        lineHeight={18}
        fontWeight="regular"
        letterSpacing={-0.07}
      >
        {get(item, 'data.readMore', '')}
      </Text>
    </Section.Stack>
    <Section.Stack
      style={{ flex: 1, alignItems: 'flex-end', marginRight: getDesignRelativeWidth(theme.sizes.defaultDouble) }}
    >
      <Icon color={theme.colors.white} name="arrow-back" size={20} style={{ transform: [{ rotateY: '180deg' }] }} />
    </Section.Stack>
  </Section.Row>
)

const NewsItem: React.FC = ({ item, eventSettings, styles }) => {
  const {
    data: { sponsoredLink, sponsoredLogo, picture },
  } = item
  const hasPicture = !!picture

  const onSponsorPress = useOnPress(() => {
    fireEvent(GOTO_SPONSOR, { link: sponsoredLink })
    Linking.openURL(sponsoredLink).catch(e => log.error('Open news feed error', e))
  }, [sponsoredLink])

  return (
    <View style={styles.rowContent}>
      <FeedListItemLeftBorder style={styles.rowContentBorder} color={eventSettings.color} isBig={hasPicture} />

      <View style={styles.newsContent}>
        {picture && <Image source={{ uri: picture }} style={styles.feedPicture} />}

        <View style={styles.innerRow}>
          <View grow style={styles.mainContents}>
            <View style={{ ...styles.transferInfo, height: undefined }} alignItems="flex-start">
              <View style={[styles.mainInfo, item.type === 'claiming' && styles.claimingCardFeedText]}>
                <EventCounterParty
                  style={styles.feedItem}
                  feedItem={item}
                  subtitle
                  isSmallDevice={isMobile && getScreenWidth() < 353}
                  numberOfLines={2}
                  isCapitalized={false}
                  lineHeight={20}
                  textStyle={styles.newsHeader}
                />

                <Text lineHeight={16} numberOfLines={3} color="gray80Percent" fontSize={12} style={styles.newsMessage}>
                  {get(item, 'data.message')}
                </Text>
              </View>
            </View>
            <View style={styles.dateContainer}>
              <Text fontSize={10} color="gray80Percent" lineHeight={17}>
                {getFormattedDateTime(item.date)}
              </Text>

              {!!sponsoredLink && !!sponsoredLogo && (
                <Pressable style={styles.sponsorContainer} onPress={onSponsorPress}>
                  <Text fontSize={10} color="gray80Percent" lineHeight={17} textAlign="left">
                    {t`Sponsored by`}{' '}
                  </Text>
                  <SvgXml src={sponsoredLogo} height="28" width="45" />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

/**
 * Render list withdraw item for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ListEvent = ({ item: feed, theme, index, styles }: FeedEventProps) => {
  const itemType = feed.displayType || feed.type
  const eventSettings = getEventSettingsByType(theme, itemType)
  const mainColor = eventSettings.color
  const isSmallDevice = isMobile && getScreenWidth() < 353
  const isFeedTypeClaiming = feed.type === 'claiming'
  const isErrorCard = ['senderror', 'withdrawerror'].includes(itemType)
  const avatar = get(feed, 'data.endpoint.avatar')

  if (itemType === 'empty') {
    return <EmptyEventFeed />
  }
  if (itemType === 'invite') {
    return (
      <View style={[styles.rowContent, { backgroundColor: theme.colors.green }]}>
        <View style={styles.innerRow}>
          <InviteItem item={feed} theme={theme} />
        </View>
      </View>
    )
  }
  if (itemType === 'news') {
    return <NewsItem item={feed} eventSettings={eventSettings} styles={styles} />
  }
  return (
    <View style={styles.rowContent}>
      <FeedListItemLeftBorder style={styles.rowContentBorder} color={eventSettings.color} />
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
                  <Text fontSize={15} lineHeight={22} fontWeight="bold" color={mainColor} style={styles.actionSymbol}>
                    {eventSettings.actionSymbol}
                  </Text>
                )}
                <BigGoodDollar
                  number={get(feed, 'data.amount', 0)}
                  color={mainColor}
                  bigNumberProps={{ fontSize: 20, lineHeight: 22 }}
                  bigNumberStyles={styles.bigNumberStyles}
                  bigNumberUnitProps={{ fontSize: 10, lineHeight: 11 }}
                />
              </React.Fragment>
            )}
          </View>
          <View style={styles.transferInfo} alignItems="flex-start">
            <Avatar size={normalize(34)} imageSize={normalize(36)} style={styles.avatarBottom} source={avatar} />
            <View style={[styles.mainInfo, isFeedTypeClaiming && styles.claimingCardFeedText]}>
              {isErrorCard ? (
                <>
                  <Text fontWeight="medium" lineHeight={19} style={styles.mainText} color="primary">
                    {t`We're sorry.`}
                  </Text>
                  <ReadMoreText
                    text={t`This transaction failed`}
                    buttonText={t`Read why...`}
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
            <EventIcon
              style={styles.typeIcon}
              animStyle={styles.typeAnimatedIcon}
              type={itemType}
              size={normalize(34)}
              showAnim={index === 0}
              delay={100}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const getWelcomeStyles = () => ({
  readMoreText: {
    letterSpacing: 0,
    marginLeft: 4,
    lineHeight: Platform.select({
      web: 12,
      default: 16,
    }),
  },
  welcomeText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    // minHeight: normalize(16),
    // maxHeight: normalize(16),
    // marginHorizontal: -theme.sizes.default,
    display: Platform.select({ web: 'inline', default: 'flex' }),
  },
})

const ReadMoreText = withStyles(getWelcomeStyles)(({ styles, theme, text, buttonText, style, color }) => (
  <View style={styles.welcomeText}>
    <Text
      textAlign="left"
      fontWeight="medium"
      lineHeight={20}
      numberOfLines={1}
      fontSize={10}
      style={style}
      color={color || 'darkGray'}
    >
      {text}
    </Text>
    <Text
      textAlign={'left'}
      color={color || theme.colors.lighterGray}
      lineHeight={20}
      numberOfLines={1}
      fontSize={10}
      style={styles.readMoreText}
    >
      {buttonText}
    </Text>
  </View>
))

const getFeedTextStyles = () => ({
  message: {
    paddingBottom: 0,
    flexShrink: 0,
  },
})

const FeedText = withStyles(getFeedTextStyles)(({ styles, feed, isSmallDevice }) => {
  let result = ''
  const readMore = get(feed, 'data.readMore', get(feed, 'data.smallReadMore', ''))
  if (readMore) {
    result = (
      <ReadMoreText
        color="gray80Percent"
        text={readMore}
        buttonText={get(feed, 'data.readMore') ? 'Learn more...' : ''}
      />
    )
  } else if (get(feed, 'data.readMore') === false) {
    //if readMore is exactly false we don't show anything
    result = null
  } else {
    result = (
      <Text
        lineHeight={20}
        numberOfLines={1}
        color="gray80Percent"
        fontSize={10}
        textTransform="capitalize"
        style={styles.message}
      >
        {get(feed, 'data.message')}
      </Text>
    )
  }
  return result
})

const getStylesFromProps = ({ theme }) => ({
  rowContent: {
    borderRadius: theme.feedItems.borderRadius,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: theme.feedItems.itemBackgroundColor,
    flex: 1,
    justifyContent: 'center',
    paddingLeft: theme.paddings.mainContainerPadding,
  },
  rowContentBorder: {
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 10,
  },
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
    borderStyle: 'solid',
    borderBottomWidth: 2,
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  dateContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  actionSymbol: {
    marginLeft: 'auto',
    marginBottom: Platform.select({
      web: 0,
      default: 4,
    }),
  },
  bigNumberStyles: {
    marginRight: theme.sizes.defaultHalf,
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
  feedPicture: {
    width: '100%',
    height: 'auto',
  },
  claimingCardFeedText: {},
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
    marginTop: theme.sizes.default - 2,
    display: 'flex',
    alignItems: 'flex-end',
  },
  typeIcon: {
    marginTop: Platform.select({ web: theme.sizes.default, default: theme.sizes.default / 2 }),
    height: normalize(35),
    width: normalize(35),
  },
  typeAnimatedIcon: {
    marginTop: Platform.select({ web: theme.sizes.default, default: theme.sizes.default / 2 }),
    alignSelf: 'flex-start',
    height: normalize(35),
    width: normalize(35),
  },
  failTransaction: {
    paddingBottom: 'auto',
  },
  mainText: {
    paddingTop: 5,
  },
  newsContent: {
    width: '100%',
    paddingLeft: 2,
  },
  newsMessage: {
    textAlign: 'left',
    paddingTop: 9,
    marginBottom: 15,
  },
  sponsorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 24,
  },
  newsHeader: {
    color: '#173566',
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
