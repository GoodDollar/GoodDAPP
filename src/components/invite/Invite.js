import React, { useEffect, useMemo, useState } from 'react'
import { Image, View } from 'react-native'
import { get, result } from 'lodash'
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
import { fireEvent, INVITE_HOWTO, INVITE_SHARE } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import { generateShareObject, isSharingAvailable } from '../../lib/share'
import userStorage from '../../lib/gundb/UserStorage'
import ModalLeftBorder from '../common/modal/ModalLeftBorder'
import { useCollectBounty, useInviteCode, useInvited } from './useInvites'
import FriendsSVG from './friends.svg'
import EtoroPNG from './etoro.png'

const log = logger.child({ from: 'Invite' })

const shareTitle = 'I signed up to GoodDollar. Join me.'
const shareMessage =
  'Hi,\nIf you believe, like me, in economic inclusion and the distribution of prosperity for all, then I invite you to sign up for GoodDollar, create your own basic income wallet and start collecting your daily digital income.\nUse my invite link and receive an extra 50G$ bonus\n\n'

const shortShareMessage =
  'Hi,\nIf you believe in economic inclusion and distribution of prosperity for all, sign up for a GoodDollar wallet and start collecting daily digital income. Use my invite link and receive an extra 50G$\n\n'

const InvitedUser = ({ name, avatar, status }) => {
  const isApproved = status === 'approved'
  return (
    <Section.Row style={{ alignItems: 'center', marginTop: theme.paddings.defaultMargin }}>
      <Avatar source={avatar} size={28} />
      <Section.Text
        fontFamily={theme.fonts.slab}
        fontSize={14}
        color={theme.colors.darkBlue}
        lineHeight={18}
        style={{
          marginLeft: theme.paddings.defaultMargin,
          textTransform: 'capitalize',
          flex: 1,
          textAlign: 'left',
        }}
      >
        {name}
      </Section.Text>
      <Section.Row alignItems={'flex-start'}>
        {isApproved ? <Icon name={'check'} color={'green'} /> : <Icon name={'time'} color={'orange'} />}

        <Section.Text
          fontWeight={'medium'}
          fontSize={12}
          color={isApproved ? 'green' : 'orange'}
          textAlign={'center'}
          lineHeight={18}
          style={{ marginLeft: 5 }}
        >
          {isApproved ? 'Claimed' : 'Pending'}
        </Section.Text>
      </Section.Row>
    </Section.Row>
  )
}

const ShareIcons = ({ shareUrl }) => {
  const buttons = [
    {
      name: 'whatsapp-1',
      service: 'whatsapp',
      Component: WhatsappShareButton,
      color: theme.colors.darkBlue,
      size: 20,
      title: shareMessage,
      separator: '',
    },
    {
      name: 'facebook-1',
      service: 'facebook',
      Component: FacebookShareButton,
      color: theme.colors.darkBlue,
      size: 20,
      quote: shareMessage,
      hashtag: '#GoodDollar',
    },
    {
      name: 'twitter-1',
      service: 'twitter',
      Component: TwitterShareButton,
      color: theme.colors.darkBlue,
      title: shortShareMessage,
    },

    {
      name: 'telegram',
      service: 'telegram',
      Component: TelegramShareButton,
      color: theme.colors.darkBlue,
      title: shareMessage,
    },
    {
      name: 'envelope',
      service: 'email',
      Component: EmailShareButton,
      color: theme.colors.darkBlue,
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
    <Section.Row style={{ marginTop: theme.paddings.defaultMargin * 2, justifyContent: 'flex-start' }}>
      {buttons.map(({ name, Component, ...props }) => (
        <Section.Stack style={{ marginRight: theme.sizes.defaultDouble }} key={name}>
          <Component
            url={shareUrl}
            {...props}
            beforeOnClick={() => {
              onShare(props.service)
            }}
          >
            <IconButton {...props} name={name} circleSize={36} />
          </Component>
        </Section.Stack>
      ))}
    </Section.Row>
  )
}

const ShareBox = ({ level }) => {
  const inviteCode = useInviteCode()
  const shareUrl = `${Config.invitesUrl}?inviteCode=${inviteCode}`
  const bounty = result(level, 'bounty.toNumber', 100) / 100

  const share = useMemo(() => generateShareObject(shareTitle, shareMessage, shareUrl), [shareUrl])

  return (
    <WavesBox primarycolor={theme.colors.primary} style={styles.linkBoxStyle} title={'Share Your Invite Link'}>
      <Section.Stack style={{ alignItems: 'flex-start', marginTop: 11, marginBottom: 11 }}>
        <Section.Text fontSize={14} textAlign={'left'} lineHeight={19}>
          {`You’ll get `}
          <Section.Text fontWeight={'bold'} fontSize={14} textAlign={'left'} lineHeight={19}>
            {`${bounty}G$`}
          </Section.Text>
          {` and they will get `}
          <Section.Text fontWeight={'bold'} fontSize={14} textAlign={'left'} lineHeight={19}>
            {`${bounty / 2}G$`}
          </Section.Text>
        </Section.Text>
      </Section.Stack>
      <Section.Row style={{ alignItems: 'flex-start' }}>
        <Text
          textAlign={'left'}
          fontSize={getDesignRelativeWidth(10, false)}
          fontWeight={'medium'}
          lineHeight={30}
          style={{
            flex: 1,
            padding: 0,
            marginRight: 8,
          }}
        >
          {shareUrl}
        </Text>
        <ShareButton
          style={{ flexGrow: 0, minWidth: 70, height: 32, minHeight: 32 }}
          color={theme.colors.primary}
          textStyle={{ fontSize: 14, color: theme.colors.white }}
          share={share}
          iconColor={'white'}
          actionText={isSharingAvailable ? 'share' : 'copy'}
          onPressed={() => fireEvent(INVITE_SHARE, { method: isSharingAvailable ? 'native' : 'copy' })}
          withoutDone
        />
      </Section.Row>
      <ShareIcons shareUrl={shareUrl} />
    </WavesBox>
  )
}

const InvitesBox = React.memo(({ invitees, refresh }) => {
  const [, bountiesCollected] = useCollectBounty()

  // const { pending = [], approved = [] } = groupBy(invitees, 'status')
  useEffect(() => {
    bountiesCollected && refresh()
  }, [bountiesCollected])

  log.debug({ invitees })
  return (
    <>
      <WavesBox primarycolor={theme.colors.primary} style={styles.linkBoxStyle} title={'Friends Who Joined'}>
        <Section.Text
          fontSize={11}
          textAlign={'left'}
          color={'secondary'}
          style={{ marginTop: theme.paddings.defaultMargin, marginBottom: theme.paddings.defaultMargin * 2 }}
        >
          * Remind them to claim G$’s so you could earn your reward
        </Section.Text>
        {invitees.map((data, i) => (
          <Section.Stack key={i}>
            <InvitedUser {...data} />
            {i < invitees.length - 1 && (
              <Section.Separator style={{ marginTop: 8 }} width={1} color={theme.colors.lightGray} />
            )}
          </Section.Stack>
        ))}
      </WavesBox>
    </>
  )
})

const TotalEarnedBox = ({ totalEarned = 0 }) => (
  <WavesBox
    primarycolor={theme.colors.green}
    style={{ margin: 0, padding: 0 }}
    contentStyle={{
      backgroundColor: theme.colors.white,
      padding: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      paddingLeft: 0,

      // paddingTop: theme.paddings.defaultMargin,
      // paddingBottom: theme.paddings.defaultMargin,
    }}
  >
    <Section.Row style={{ justifyContent: 'space-between' }}>
      <Section.Text
        style={{ textTransform: 'capitalize', marginLeft: theme.paddings.defaultMargin * 1.5 }}
        color={'darkBlue'}
        fontWeight={'bold'}
        fontSize={18}
        letterSpacing={0.09}
        textAlign={'left'}
        lineHeight={32}
      >
        Total Rewards Earned
      </Section.Text>
      <ModalLeftBorder
        borderColor={theme.colors.green}
        style={{
          maxWidth: '100%',
          flexGrow: 0,
          padding: theme.paddings.defaultMargin * 1.5,
          paddingVertical: theme.paddings.defaultMargin,
          borderRadius: 0,
          borderBottomRightRadius: 10,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <Section.Row style={{ alignItems: 'baseline' }}>
          <Section.Text fontWeight={'bold'} lineHeight={26} color={theme.colors.white} fontSize={24}>
            {totalEarned}
          </Section.Text>
          <Section.Text fontWeight={'bold'} color={theme.colors.white} lineHeight={26} fontSize={14}>
            G$
          </Section.Text>
        </Section.Row>
      </ModalLeftBorder>
    </Section.Row>
  </WavesBox>
)

const InvitesHowTO = () => {
  const Step = ({ label, text }) => (
    <Section.Row style={{ justifyContent: 'flex-start', marginTop: theme.sizes.defaultDouble }}>
      <Section.Stack style={{ borderRadius: 29, width: 58, height: 58, backgroundColor: theme.colors.primary }}>
        <Section.Text fontFamily={'slab'} color={theme.colors.white} lineHeight={58} fontSize={22} fontWeight={'bold'}>
          {label}
        </Section.Text>
      </Section.Stack>
      <Section.Stack
        style={{ marginLeft: theme.sizes.defaultDouble, height: 58, flexShrink: 1, justifyContent: 'center' }}
      >
        <Section.Text color={theme.colors.darkBlue} lineHeight={20} fontSize={15} textAlign={'left'}>
          {text}
        </Section.Text>
      </Section.Stack>
    </Section.Row>
  )
  const SVGWrapper = ({ svg: SVG, width, height, style, svgStyle }) => {
    return (
      <Section.Stack
        style={[{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', justifySelf: 'center' }, style]}
      >
        <SVG svgStyle={svgStyle} />
      </Section.Stack>
    )
  }
  return (
    <Section.Stack style={{ marginHorizontal: getDesignRelativeWidth(theme.sizes.default * 5, false) }}>
      <SVGWrapper
        svg={FriendsSVG}
        style={{ marginTop: theme.sizes.default * 5, marginBottom: theme.sizes.defaultDouble }}
      />
      <Step label="01" text="Copy your personal invite link and send it to your friends" />
      <Step label="02" text="Make sure they sign up and claim at least once" />
      <Step label="03" text="Get rewarded right after they claim" />
      <Section.Row style={{ justifyContent: 'center', marginTop: theme.sizes.default * 3 }}>
        <Section.Text
          style={{ alignSelf: 'flex-end' }}
          color={theme.colors.darkBlue}
          linelineHeight={16}
          fontSize={12}
          textAlign={'center'}
        >
          Rewards pool is sponsored by
        </Section.Text>
        <Image
          source={EtoroPNG}
          resizeMode={'contain'}
          resizeMethod={'scale'}
          style={{ marginLeft: 2.5, width: 45, height: 18, marginBottom: 1 }}
        />
      </Section.Row>
    </Section.Stack>
  )
}

const InvitesData = ({ invitees, refresh, level, totalEarned = 0 }) => (
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
      <TotalEarnedBox totalEarned={totalEarned} />
    </Section.Stack>
    <Section.Stack style={{ alignSelf: 'stretch', marginTop: theme.paddings.defaultMargin * 1.5 }}>
      <InvitesBox invitees={invitees} refresh={refresh} />
    </Section.Stack>
  </>
)

const Invite = () => {
  const [showHowTo, setShowHowTo] = useState(true)
  const [invitees, refresh, level, inviteState] = useInvited()

  const totalEarned = get(inviteState, 'totalEarned', 0)
  const bounty = result(level, 'bounty.toNumber', 100) / 100

  const toggleHowTo = () => {
    !showHowTo && fireEvent(INVITE_HOWTO)
    setShowHowTo(!showHowTo)
  }

  useEffect(() => {
    //reset state for rewards icon in navbar
    if (inviteState.pending || inviteState.approved) {
      userStorage.userProperties.set('lastInviteState', inviteState)
    }
  }, [inviteState])

  return (
    <Wrapper style={styles.pageBackground} backgroundColor={theme.colors.lightGray}>
      <Section.Stack style={styles.headLine}>
        <Section.Text
          letterSpacing={0.14}
          fontWeight={'bold'}
          fontFamily={theme.fonts.slab}
          fontSize={28}
          color={theme.colors.darkBlue}
          lineHeight={34}
        >
          {`Get ${bounty}G$`}
        </Section.Text>
        <Section.Text
          letterSpacing={0.1}
          fontWeight={'bold'}
          fontFamily={theme.fonts.slab}
          fontSize={20}
          color={theme.colors.primary}
          lineHeight={34}
        >
          For Each Friend You Invite!
        </Section.Text>
      </Section.Stack>
      <Section.Stack style={{ marginTop: theme.sizes.defaultDouble }}>
        <Section.Text letterSpacing={-0.07} lineHeight={20} fontSize={15} color={theme.colors.darkBlue}>
          {`Make sure they claim to get your reward`}
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
          icon={showHowTo ? 'arrow-up' : 'arrow-down'}
          mode="text"
          textStyle={{ fontWeight: 'bold', letterSpacing: 0, textDecorationLine: 'underline' }}
          onPress={toggleHowTo}
        >
          {`How Do I Invite People?`}
        </CustomButton>
      </View>
      {showHowTo && <InvitesHowTO />}
      <InvitesData {...{ invitees, refresh, level, totalEarned }} />
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
    flex: 1,
    height: '100%',
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
