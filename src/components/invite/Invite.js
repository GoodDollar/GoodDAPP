// @flow
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, TextInput, View } from 'react-native'
import { get, isNaN, isNil, noop } from 'lodash'
import { t } from '@lingui/macro'

import { CustomButton, Icon, Section, ShareButton, Text, Wrapper } from '../common'
import Avatar from '../common/view/Avatar'
import { WavesBox } from '../common/view/WavesBox'
import { theme } from '../theme/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import logger from '../../lib/logger/js-logger'
import { captureUtmTags, fireEvent, INVITE_HOWTO, INVITE_SHARE } from '../../lib/analytics/analytics'
import { isSharingAvailable } from '../../lib/share'
import { usePublicProfileOf, useUserProperty } from '../../lib/userStorage/useProfile'
import ModalLeftBorder from '../common/modal/ModalLeftBorder'
import { useDialog } from '../../lib/dialog/useDialog'
import LoadingIcon from '../common/modal/LoadingIcon'
import { InfoIcon } from '../common/modal/InfoIcon'

import { withStyles } from '../../lib/styles'
import CeloLogo from '../../assets/celo-logo.svg'

import {
  useFormatG$,
  usePropSuffix,
  useSwitchNetworkModal,
  useUserStorage,
  useWallet,
} from '../../lib/wallet/GoodWalletProvider'
import { createUrlObject } from '../../lib/utils/uri'

import { decimalsToFixed } from '../../lib/wallet/utils'
import {
  useCollectBounty,
  useInviteBonus,
  useInviteCode,
  useInvited,
  useInviteScreenOpened,
  useInviteShare,
  useRegisterForInvites,
} from './useInvites'
import FriendsSVG from './friends.svg'
import ShareIcons from './ShareIcons'

// import useShareMessages from './useShareMessages'

const log = logger.child({ from: 'Invite' })

const Divider = ({ size = 10 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

const InvitedUser = ({ address, status }) => {
  const profile = usePublicProfileOf(address)
  const isApproved = status === 'approved'

  return (
    <Section.Row style={{ alignItems: 'center', marginTop: theme.paddings.defaultMargin }}>
      <Avatar source={profile?.smallAvatar} size={28} />
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
        {profile?.fullName}
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

export const ShareInviteButton = ({ share, altCopy, styles, eventType = 'share' }) => (
  <ShareButton
    style={[styles, { minWidth: 70, height: 32, minHeight: 32 }]}
    color={theme.colors.primary}
    textStyle={{ fontSize: 14, color: theme.colors.white }}
    share={share}
    iconColor={'white'}
    actionText={altCopy ? altCopy : isSharingAvailable ? 'share' : 'copy'}
    onPressed={() => fireEvent(INVITE_SHARE, { method: isSharingAvailable ? 'native' : 'copy', type: eventType })}
    withoutDone
  />
)

export const ShareBox = ({ level, styles }) => {
  const { share, shareUrl, bounty } = useInviteShare(level)

  return (
    <WavesBox primarycolor={theme.colors.primary} style={styles.linkBoxStyle} title={t`Share Your Invite Link`}>
      <Section.Stack style={{ alignItems: 'flex-start', marginTop: 11, marginBottom: 11 }}>
        <Section.Text fontSize={14} textAlign={'left'} lineHeight={19}>
          {t`You’ll get`}{' '}
          <Section.Text fontWeight={'bold'} fontSize={14} textAlign={'left'} lineHeight={19}>
            {` ${bounty}G$ `}
          </Section.Text>{' '}
          {t`and they will get `}
          <Section.Text fontWeight={'bold'} fontSize={14} textAlign={'left'} lineHeight={19}>
            {` `}
            {` ${bounty / 2}G$`}
          </Section.Text>
        </Section.Text>
      </Section.Stack>
      <Section.Row style={{ alignItems: 'flex-start' }}>
        <Text
          textAlign={'left'}
          fontSize={getDesignRelativeWidth(10, false)}
          fontWeight={'medium'}
          lineHeight={30}
          style={styles.shareLink}
          numberOfLines={1}
        >
          {shareUrl}
        </Text>
        <ShareInviteButton share={share} />
      </Section.Row>
      <ShareIcons shareUrl={shareUrl} />
    </WavesBox>
  )
}

const InputCodeBox = ({ screenProps, styles }) => {
  const ownInviteCode = useInviteCode()
  const registerForInvites = useRegisterForInvites()
  const { hideDialog, showDialog } = useDialog()
  const [collected, getCanCollect, collectInviteBounty] = useInviteBonus()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const propSuffix = usePropSuffix()
  const [inviteCodeUsed] = useUserProperty(`inviterInviteCodeUsed${propSuffix}`)
  const [code, setCode] = useState(userStorage.userProperties.get(`inviterInviteCode${propSuffix}`) || '')
  const { navigateTo } = screenProps

  // if code wasnt a url it will not have any query params and will then use code as default
  const extractedCode = useMemo(() => get(createUrlObject(code), 'params.inviteCode', code), [code])
  const isValidCode = extractedCode.length >= 10 && extractedCode.length <= 32 && extractedCode !== ownInviteCode

  // disable button if code invalid or cant collect
  const [disabled, setDisabled] = useState(!isValidCode)

  const onUnableToCollect = useCallback(async () => {
    const isCitizen = await goodWallet.isCitizen()

    await showDialog({
      image: <InfoIcon />,
      title: isCitizen ? t`Your inviter is not verified yet` : t`Claim your first G$s`,
      message: isCitizen
        ? t`Ask your inviter to get verified by Claiming his first G$s`
        : t`In order to receive the reward`,
      buttons: !isCitizen && [
        {
          text: t`Later`,
          mode: 'text',
          color: theme.colors.gray80Percent,
          onPress: dismiss => {
            dismiss()
          },
        },
        {
          text: t`Claim Now`,
          onPress: dismiss => {
            dismiss()
            navigateTo('Claim')
          },
        },
      ],
    })
  }, [navigateTo, showDialog, goodWallet])

  const onSubmit = useCallback(async () => {
    showDialog({
      image: <LoadingIcon />,
      loading: true,
      message: t`Please wait
      This might take a few seconds`,
      showButtons: false,
      title: t`Collecting Invite Reward`,
      showCloseButtons: false,
      onDismiss: noop,
    })

    try {
      // capture utm tags from invite link
      captureUtmTags(code)
      await registerForInvites(extractedCode)
      await collectInviteBounty(onUnableToCollect)
    } catch (e) {
      log.warn('collectInviteBounty failed', e.message, e)
    } finally {
      hideDialog()
    }
  }, [extractedCode, showDialog, hideDialog, onUnableToCollect, collectInviteBounty, registerForInvites])

  // manages the get reward button state (disabled/enabled)
  useEffect(() => {
    log.debug('updating disabled state:', { extractedCode, isValidCode, ownInviteCode, inviteCodeUsed })

    if (collected) {
      log.debug('not updating disabled state: bounty collected')
      return
    }

    if (!inviteCodeUsed) {
      log.debug('updating disabled state: invite code used')
      log.debug('updating disabled state: ', { isValidCode })

      setDisabled(!isValidCode)

      if (isValidCode) {
        log.debug('updating disabled state: code is valid')

        goodWallet
          .isInviterCodeValid(extractedCode)
          .catch(e => {
            log.error('failed to check is inviter valid:', e.message, e)
            return false
          })
          .then(isValidInviter => {
            log.debug('updating disabled state:', { isValidInviter })
            setDisabled(!isValidInviter)
          })
      }

      return
    }

    log.debug('updating disabled state: invite code NOT used')

    getCanCollect().then(canCollect => {
      log.debug('updating disabled state:', { canCollect })
      setDisabled(!canCollect)
    })
  }, [extractedCode, isValidCode, inviteCodeUsed, collected, setDisabled, getCanCollect, goodWallet])

  if (collected) {
    return null
  }

  return (
    <WavesBox title={'Use invite code'} primarycolor={theme.colors.green} style={styles.linkBoxStyle}>
      <Section.Stack style={{ alignItems: 'flex-start', marginTop: 11, marginBottom: 11 }}>
        <Section.Row style={{ width: '100%', alignItems: 'center' }}>
          <TextInput
            editable={!inviteCodeUsed}
            value={extractedCode}
            onChangeText={setCode}
            style={{
              flex: 1,
              paddingVertical: 8,
              marginRight: 12,
            }}
            placeholder="Paste your invite code/link here"
            placeholderTextColor={theme.colors.gray50Percent}
          />
          <CustomButton
            textStyle={{ fontSize: 14, color: theme.colors.white }}
            style={{ flexGrow: 0, minWidth: 70, height: 32, minHeight: 32 }}
            onPress={onSubmit}
            disabled={disabled}
          >
            {t`Get Reward`}
          </CustomButton>
        </Section.Row>
      </Section.Stack>
    </WavesBox>
  )
}

const InvitesBox = React.memo(({ screenProps, invitees, refresh, styles }) => {
  const [, bountiesCollected] = useCollectBounty(screenProps)

  // const { pending = [], approved = [] } = groupBy(invitees, 'status')
  useEffect(() => {
    bountiesCollected && refresh()
  }, [bountiesCollected])

  log.debug({ invitees })
  return (
    <>
      <WavesBox primarycolor={theme.colors.primary} style={styles.linkBoxStyle} title={t`Friends Who Joined`}>
        <Section.Text
          fontSize={11}
          textAlign={'left'}
          color={'secondary'}
          style={{ marginTop: theme.paddings.defaultMargin, marginBottom: theme.paddings.defaultMargin * 2 }}
        >
          {t`* Remind them to claim G$’s so you could earn your reward`}
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
        {t`Total Rewards Earned`}
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
            {t`G$`}
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
      <Section.Stack style={[{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }, style]}>
        <SVG style={svgStyle} />
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
          lineHeight={16}
          fontSize={12}
          textAlign={'center'}
        >
          {t`Rewards pool is sponsored by`}
        </Section.Text>
        <SVGWrapper svg={CeloLogo} style={{ marginLeft: 10 }} />
      </Section.Row>
    </Section.Stack>
  )
}

const InvitesData = ({ invitees, refresh, level, totalEarned = 0, screenProps, styles }) => (
  <View style={{ width: '100%' }}>
    <Divider size={getDesignRelativeHeight(theme.paddings.defaultMargin * 3, false)} />
    <Section.Stack>
      <InputCodeBox screenProps={screenProps} styles={styles} />
    </Section.Stack>
    <Divider size={theme.paddings.defaultMargin * 1.5} />
    <Section.Stack>
      <ShareBox level={level} styles={styles} />
    </Section.Stack>
    <Divider size={theme.paddings.defaultMargin * 1.5} />
    <Section.Stack>
      <TotalEarnedBox totalEarned={totalEarned} />
    </Section.Stack>
    <Divider size={theme.paddings.defaultMargin * 1.5} />
    <Section.Stack>
      <InvitesBox screenProps={screenProps} invitees={invitees} refresh={refresh} styles={styles} />
    </Section.Stack>
  </View>
)

const Invite = ({ screenProps, styles }) => {
  const { wasOpened } = useInviteScreenOpened()
  const { toDecimals } = useFormatG$()
  useSwitchNetworkModal('CELO', screenProps.goToRoot)

  const [showHowTo, setShowHowTo] = useState(!wasOpened)
  const [invitees, refresh, level, inviteState] = useInvited()
  const userStorage = useUserStorage()
  const propSuffix = usePropSuffix()

  const totalEarned = parseInt(get(inviteState, 'totalEarned', 0))
  const bounty = decimalsToFixed(toDecimals(get(level, 'bounty', 0)))

  const toggleHowTo = () => {
    !showHowTo && fireEvent(INVITE_HOWTO)
    setShowHowTo(!showHowTo)
  }

  useEffect(() => {
    // reset state for rewards icon in navbar
    if (inviteState.pending || inviteState.approved) {
      userStorage.userProperties.safeSet(`lastInviteState${propSuffix}`, inviteState)
    }
  }, [inviteState, propSuffix])

  if (isNil(bounty) || isNaN(bounty)) {
    return null
  }

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
          style={styles.bounty}
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
          {t`For Each Friend You Invite!`}
        </Section.Text>
      </Section.Stack>
      <Divider size={theme.sizes.defaultDouble} />
      <Section.Text letterSpacing={-0.07} lineHeight={20} fontSize={15} color={theme.colors.darkBlue}>
        {t`Make sure they claim to get your reward`}
      </Section.Text>
      <Divider size={getDesignRelativeHeight(theme.paddings.defaultMargin * 3, false)} />
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
        {t`How Do I Invite People?`}
      </CustomButton>
      {showHowTo && <InvitesHowTO />}
      <InvitesData {...{ invitees, refresh, level, totalEarned, screenProps, styles }} />
    </Wrapper>
  )
}

Invite.navigationOptions = {
  title: 'Invite',
}

const getStylesFromProps = ({ theme }) => ({
  pageBackground: {
    backgroundColor: theme.colors.lightGray,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    flexBasis: 1,
    paddingBottom: 50,
    height: '100%',
    minHeight: Platform.select({
      web: 788,
      android: 1150,
    }),
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
  bounty: {
    height: 34,
  },
  shareLink: {
    flex: 1,
    padding: 0,
    marginRight: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: { whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
      default: {},
    }),
  },
})

export default withStyles(getStylesFromProps)(Invite)
