import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, View } from 'react-native'
import { groupBy } from 'lodash'

import { Avatar, CustomButton, Icon, Section, ShareButton, Text, Wrapper } from '../common'
import { WavesBox } from '../common/view/WavesBox'

import { generateShareObject, isSharingAvailable } from '../../lib/share'

import { fireEvent, INVITE_SHARE } from '../../lib/analytics/analytics'
import { isMobileNative } from '../../lib/utils/platform'
import logger from '../../lib/logger/pino-logger'

import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { theme } from '../theme/styles'
import Config from '../../config/config'
import { useCollectBounty, useInviteCode, useInvited } from './useInvites'
import ShareIcons from './ShareIcons'
import HowToSVG from './howto.svg'

const log = logger.child({ from: 'Invite' })

const shareTitle = 'I signed up to GoodDollar. Join me.'
const shareMessage =
  "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n"

const InvitedUser = ({ name, avatar, status }) => (
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
        textAlign: 'start',
      }}
    >
      {name}
    </Section.Text>
    {status === 'approved' && <Icon name={'success'} color={'green'} />}
  </Section.Row>
)

const sharingMethod = isSharingAvailable ? 'share' : 'copy'
const fireShareEvent = () => fireEvent(INVITE_SHARE, { method: sharingMethod })

const ShareBox = ({ shareUrl }) => {
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
            10 G$
          </Section.Text>{' '}
          for each friend you invite
        </Section.Text>
      </Section.Stack>
      <Section.Row style={{ alignItems: 'center' }}>
        <Text fontSize={11} style={{ flex: 1, borderWidth: 1, padding: 9, marginRight: 8, borderRadius: 50 }}>
          {shareUrl}
        </Text>
        <ShareButton
          style={{ width: 70, height: 32, minHeight: 32 }}
          color={theme.colors.darkBlue}
          textStyle={{ fontSize: 14, color: theme.colors.white }}
          share={share}
          iconColor={theme.colors.white}
          onPressed={fireShareEvent}
          actionText={sharingMethod}
        />
      </Section.Row>
      <ShareIcons shareTitle={shareTitle} shareMessage={shareMessage} shareUrl={shareUrl} />
    </WavesBox>
  )
}

const InvitesBox = React.memo(() => {
  const [invitees, refresh] = useInvited()
  const [, bountiesCollected] = useCollectBounty()

  const { pending = [], approved = [] } = useMemo(() => groupBy(invitees, 'status'), [invitees])

  useEffect(() => {
    bountiesCollected && refresh()
  }, [bountiesCollected])

  useEffect(() => {
    log.debug({ invitees, pending, approved })
  }, [invitees, pending, approved])

  return (
    <>
      <WavesBox
        primaryColor={theme.colors.orange}
        style={styles.linkBoxStyle}
        title={'Friends Who Joined & Need To Claim'}
      >
        <Section.Text
          fontSize={11}
          textAlign={'start'}
          color={'secondary'}
          style={{ marginTop: theme.paddings.defaultMargin }}
        >
          * Remind them to claim G$’s so you could earn your reward
        </Section.Text>
        {pending.map((data, i) => (
          <>
            <InvitedUser {...data} />
            {i < pending.length - 1 && (
              <Section.Separator style={{ marginTop: 8 }} width={1} color={theme.colors.lightGray} />
            )}
          </>
        ))}
      </WavesBox>
      <WavesBox
        primaryColor={theme.colors.green}
        style={[styles.linkBoxStyle, { marginTop: theme.paddings.defaultMargin * 1.5 }]}
        title={'Friends Who Joined & Claimed'}
      >
        {approved.map((data, i) => (
          <>
            <InvitedUser {...data} />
            {i < approved.length - 1 && (
              <Section.Separator style={{ marginTop: 8 }} width={1} color={theme.colors.lightGray} />
            )}
          </>
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

const InvitesData = ({ shareUrl }) => (
  <>
    <Section.Stack
      style={{ alignSelf: 'stretch', marginTop: getDesignRelativeHeight(theme.paddings.defaultMargin * 3, false) }}
    >
      <ShareBox shareUrl={shareUrl} />
    </Section.Stack>
    <Section.Stack style={{ alignSelf: 'stretch', marginTop: theme.paddings.defaultMargin * 1.5 }}>
      <InvitesBox />
    </Section.Stack>
  </>
)

const Invite = () => {
  const inviteCode = useInviteCode()
  const [showHowTo, setShowHowTo] = useState(false)
  const shareUrl = `${Config.publicUrl}?inviteCode=${inviteCode}`
  const toggleHowTo = useCallback(() => setShowHowTo(!showHowTo), [showHowTo, setShowHowTo])

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
          icon={`arrow-${showHowTo ? 'up' : 'down'}`}
          mode="text"
          textStyle={{ fontWeight: 'bold', letterSpacing: 0, textDecorationLine: 'underline' }}
          onPress={toggleHowTo}
        >
          {`How Do I Invite People?`}
        </CustomButton>
      </View>
      {showHowTo ? <InvitesHowTO /> : <InvitesData shareUrl={shareUrl} />}
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
