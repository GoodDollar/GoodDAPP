import React, { useEffect, useMemo, useState } from 'react'
import { Image, View } from 'react-native'
import { groupBy, result } from 'lodash'
import {
  EmailShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share'
import { Avatar, CustomButton, Icon, IconButton, Section, ShareButton, Text, Wrapper } from '../common'
import { WavesBox } from '../common/view/WavesBox'
import { theme } from '../theme/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import logger from '../../lib/logger/pino-logger'
import { isMobile, isMobileNative } from '../../lib/utils/platform'
import { fireEvent, INVITE_SHARE } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import { generateShareObject, isSharingAvailable } from '../../lib/share'
import { useCollectBounty, useInviteCode, useInvited } from './useInvites'
import HowToSVG from './howto.svg'

const log = logger.child({ from: 'Invite' })

const shareTitle = 'I signed up to GoodDollar. Join me.'
const shareMessage =
  "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n"

const InvitedUser = ({ name, avatar, status }) => {
  return (
    <Section.Row style={{ alignItems: 'center', marginTop: theme.paddings.defaultMargin }}>
      <Avatar source={avatar} size={28} />
      <Section.Text
        fontFamily={theme.fonts.slab}
        fontSize={14}
        color={theme.colors.darkBlue}
        style={{
          marginLeft: theme.paddings.defaultMargin,
          textTransform: 'capitalize',
          flex: 1,
          textAlign: 'justify',
        }}
      >
        {name}
      </Section.Text>
      {status === 'approved' && <Icon name={'success'} color={'green'} />}
    </Section.Row>
  )
}

const ShareIcons = ({ shareUrl }) => {
  const buttons = [
    {
      name: 'whatsapp-1',
      service: 'whatsapp',
      Component: WhatsappShareButton,
      color: '#25D066',
      size: 20,
      title: shareMessage,
      separator: '',
    },
    {
      name: 'facebook-1',
      service: 'facebook',
      Component: FacebookShareButton,
      color: theme.colors.facebookBlue,
      size: 20,
      quote: shareMessage,
      hashtag: '#GoodDollar',
    },
    {
      name: 'twitter-1',
      service: 'twitter',
      Component: TwitterShareButton,
      color: '#1DA1F3',
      title: shareMessage,
      hashtags: ['GoodDollar', 'UBI'],
    },

    {
      name: 'telegram',
      service: 'telegram',
      Component: TelegramShareButton,
      color: '#30A6DE',
      title: shareMessage,
    },
    {
      name: 'envelope',
      service: 'email',
      Component: EmailShareButton,
      color: theme.colors.googleRed,
      size: 20,
      subject: shareTitle,
      body: shareMessage,
      separator: '',
    },
  ]

  const onShare = service => {
    fireEvent(INVITE_SHARE, { method: service })
  }

  return (
    <Section.Row style={{ marginTop: theme.paddings.defaultMargin * 2 }}>
      <Section.Text style={{ flex: 1 }} fontSize={11} color={theme.colors.secondary}>
        Or share with:
      </Section.Text>
      {buttons.map(({ name, Component, ...props }) => (
        <Section.Stack style={{ marginLeft: theme.paddings.defaultMargin * 1.5 }} key={name}>
          <Component url={shareUrl} {...props}>
            <IconButton {...props} name={name} circleSize={36} onPress={() => onShare(props.service)} />
          </Component>
        </Section.Stack>
      ))}
    </Section.Row>
  )
}

const ShareBox = ({ level }) => {
  const inviteCode = useInviteCode()
  const shareUrl = `${Config.publicUrl}?inviteCode=${inviteCode}`
  const bounty = result(level, 'bounty.toNumber', 100) / 100

  const share = useMemo(
    () => (isSharingAvailable ? generateShareObject(shareTitle, shareMessage, shareUrl) : shareUrl),
    [shareUrl],
  )

  return (
    <WavesBox primaryColor={theme.colors.darkBlue} style={styles.linkBoxStyle} title={'Share This Link'}>
      <Section.Stack style={{ alignItems: 'flex-start', marginTop: 11, marginBottom: 11 }}>
        <Section.Text fontSize={14}>
          Get{' '}
          <Section.Text fontSize={14} fontWeight={'bold'}>
            {bounty} G$
          </Section.Text>{' '}
          for each friend you invite
        </Section.Text>
      </Section.Stack>
      <Section.Row style={{ alignItems: 'center' }}>
        <Text
          fontSize={11}
          lineHeight={30}
          style={{ flex: 1, borderWidth: 1, padding: 0, marginRight: 8, borderRadius: 50 }}
        >
          {shareUrl}
        </Text>
        <ShareButton
          style={{ flexGrow: 0, minWidth: 70, height: 32, minHeight: 32 }}
          color={theme.colors.darkBlue}
          textStyle={{ fontSize: 14, color: theme.colors.white }}
          share={share}
          iconColor={'white'}
          actionText={isSharingAvailable ? 'share' : 'copy'}
          onPressed={() => fireEvent(INVITE_SHARE, { method: isSharingAvailable ? 'share' : 'copy' })}
        />
      </Section.Row>
      {!isMobile && <ShareIcons shareUrl={shareUrl} />}
    </WavesBox>
  )
}

const InvitesBox = React.memo(({ invitees, refresh }) => {
  const [, bountiesCollected] = useCollectBounty()

  const { pending = [], approved = [] } = groupBy(invitees, 'status')
  useEffect(() => {
    bountiesCollected && refresh()
  }, [bountiesCollected])

  log.debug({ invitees, pending, approved })
  return (
    <>
      <WavesBox
        primaryColor={theme.colors.orange}
        style={styles.linkBoxStyle}
        title={'Friends Who Joined & Need To Claim'}
      >
        <Section.Text
          fontSize={11}
          textAlign={'justify'}
          color={'secondary'}
          style={{ marginTop: theme.paddings.defaultMargin }}
        >
          * Remind them to claim G$’s so you could earn your reward
        </Section.Text>
        {pending.map((data, i) => (
          <Section.Stack key={i}>
            <InvitedUser {...data} />
            {i < pending.length - 1 && (
              <Section.Separator style={{ marginTop: 8 }} width={1} color={theme.colors.lightGray} />
            )}
          </Section.Stack>
        ))}
      </WavesBox>
      <WavesBox
        primaryColor={theme.colors.green}
        style={[styles.linkBoxStyle, { marginTop: theme.paddings.defaultMargin * 1.5 }]}
        title={'Friends Who Joined & Claimed'}
      >
        {approved.map((data, i) => (
          <Section.Stack key={i}>
            <InvitedUser {...data} />
            {i < approved.length - 1 && (
              <Section.Separator style={{ marginTop: 8 }} width={1} color={theme.colors.lightGray} />
            )}
          </Section.Stack>
        ))}
      </WavesBox>
    </>
  )
})

const InvitesHowTO = () => (
  <Section.Stack
    style={{ width: getDesignRelativeWidth(328, false), height: getDesignRelativeHeight(448, false), flex: 1 }}
  >
    {isMobileNative === false ? (
      <Image
        style={{ width: getDesignRelativeWidth(328, false), height: getDesignRelativeHeight(448, false) }}
        source={HowToSVG}
        resizeMode={'contain'}
      />
    ) : (
      <HowToSVG />
    )}
  </Section.Stack>
)

const InvitesData = ({ invitees, refresh, level }) => (
  <>
    <Section.Stack
      style={{
        alignSelf: 'stretch',
        marginTop: getDesignRelativeHeight(theme.paddings.defaultMargin * 3, false),
      }}
    >
      <ShareBox level={level} />
    </Section.Stack>
    <Section.Stack style={{ alignSelf: 'stretch', marginTop: theme.paddings.defaultMargin * 1.5 }}>
      <InvitesBox invitees={invitees} refresh={refresh} />
    </Section.Stack>
  </>
)

const Invite = () => {
  const [showHowTo, setShowHowTo] = useState(false)
  const [invitees, refresh, level] = useInvited()

  const toggleHowTo = () => setShowHowTo(!showHowTo)

  return (
    <Wrapper style={styles.pageBackground} backgroundColor={theme.colors.lightGray}>
      <Section.Stack style={styles.headLine}>
        <Section.Text
          letterSpacing={0.14}
          fontWeight={'bold'}
          fontFamily={theme.fonts.slab}
          fontSize={28}
          color={theme.colors.darkBlue}
        >
          {`Be a Good Friend\nand Invite Everyone\nTo GoodDollar`}
        </Section.Text>
      </Section.Stack>
      <Section.Stack style={{ marginTop: 10 }}>
        <Section.Text fontSize={14} color={theme.colors.darkBlue}>
          {`The more people who join GoodDollar,\nthe faster our economy will grow…`}
        </Section.Text>
      </Section.Stack>
      <View
        style={{
          marginTop: getDesignRelativeHeight(theme.paddings.defaultMargin * 3, false),
        }}
      >
        <CustomButton
          color={theme.colors.darkBlue}
          iconColor={theme.colors.darkBlue}
          iconStyle={{ marginLeft: 10 }}
          iconAlignment="right"
          icon="arrow-down"
          mode="text"
          textStyle={{ fontWeight: 'bold', letterSpacing: 0, textDecorationLine: 'underline' }}
          onPress={toggleHowTo}
        >
          {`How Do I Invite People?`}
        </CustomButton>
      </View>
      {showHowTo ? <InvitesHowTO /> : <InvitesData {...{ invitees, refresh, level }} />}
    </Wrapper>
  )
}

Invite.navigationOptions = {
  title: 'Invite',
}

const styles = {
  pageBackground: {
    backgroundColor: theme.colors.lightGray,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  linkBoxStyle: {
    backgroundColor: theme.colors.white,
    minHeight: 100,
  },
  headLine: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: getDesignRelativeHeight(theme.paddings.defaultMargin * 3, false),
  },
}
export default Invite
