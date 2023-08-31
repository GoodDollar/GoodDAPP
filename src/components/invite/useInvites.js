import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { get, groupBy, keyBy, noop } from 'lodash'
import { t } from '@lingui/macro'
import { usePostHog } from 'posthog-react-native'

import { useFormatG$, usePropSuffix, useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { useDialog } from '../../lib/dialog/useDialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'
import { decorate, ExceptionCode } from '../../lib/exceptions/utils'
import { generateShareObject } from '../../lib/share'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { INVITE_CODE } from '../../lib/constants/localStorage'
import { decimalsToFixed } from '../../lib/wallet/utils'
import Config from '../../config/config'
import SuccessIcon from '../common/modal/SuccessIcon'
import LoadingIcon from '../common/modal/LoadingIcon'
import { useUserProperty } from '../../lib/userStorage/useProfile'
import mustache from '../../lib/utils/mustache'
import { isWeb } from '../../lib/utils/platform'

import createABTesting from '../../lib/hooks/useABTesting'
const { useOption } = createABTesting('INVITE_CAMPAIGNS')

const log = logger.child({ from: 'useInvites' })

const collectedProp = 'inviteBonusCollected'
const wasOpenedProp = 'hasOpenedInviteScreen'

export const useRegisterForInvites = () => {
  const userStorage = useUserStorage()
  const goodWallet = useWallet()
  const propSuffix = usePropSuffix()

  const registerForInvites = useCallback(
    async inviterInviteCode => {
      const { userProperties } = userStorage
      const codeProp = `inviteCode${propSuffix}`
      const inviterUsedProp = `inviterInviteCodeUsed${propSuffix}`
      let code = userProperties.get(codeProp)
      let usedInviterCode = userProperties.get(inviterUsedProp)

      // if already have code and already set inviter or dont have one just return
      if (code && (usedInviterCode || !inviterInviteCode)) {
        return code
      }

      log.debug('joining invites contract:', { inviterInviteCode })

      try {
        const inviteCode = await goodWallet.joinInvites(inviterInviteCode)

        log.debug('joined invites contract:', { inviteCode, inviterInviteCode })
        userProperties.safeSet(codeProp, inviteCode)

        // in case we were invited fire event
        if (inviterInviteCode && !usedInviterCode) {
          fireEvent(INVITE_JOIN, { inviterInviteCode })

          userProperties.safeSet({
            [inviterUsedProp]: true,
            [`inviterInviteCode${propSuffix}`]: inviterInviteCode,
          })
        }

        return inviteCode
      } catch (e) {
        log.error(t`registerForInvites failed`, e.message, e, { inviterInviteCode })
      }
    },
    [userStorage, goodWallet, propSuffix],
  )

  return registerForInvites
}

export const useInviteCode = (registerOnlyInvited = false) => {
  const userStorage = useUserStorage()
  const registerForInvites = useRegisterForInvites()

  const inviteCodePromiseRef = useRef()
  const [inviteCode, setInviteCode] = useState()

  const propSuffix = usePropSuffix()

  const getInviteCode = useCallback(async () => {
    const inviterInviteCode =
      userStorage.userProperties.get(`inviterInviteCode${propSuffix}`) || (await AsyncStorage.getItem(INVITE_CODE))

    if (registerOnlyInvited && !inviterInviteCode) {
      return
    }

    const code = await registerForInvites(inviterInviteCode)

    // fix accidental selfinvite
    if (code === inviterInviteCode) {
      userStorage.userProperties.set(`inviterInviteCode${propSuffix}`, undefined)
      AsyncStorage.setItem(INVITE_CODE, undefined)
    }

    return code
  }, [registerForInvites, propSuffix])

  useEffect(() => {
    setInviteCode(userStorage.userProperties.get(`inviteCode${propSuffix}`))
  }, [userStorage, setInviteCode, propSuffix])

  useEffect(() => {
    log.debug('useInviteCode didmount:', { inviteCode })

    if (Config.enableInvites) {
      if (!inviteCodePromiseRef.current) {
        inviteCodePromiseRef.current = getInviteCode()
      }

      inviteCodePromiseRef.current.then(code => {
        log.debug('useInviteCode registered user result:', { code })
        setInviteCode(code)
        inviteCodePromiseRef.current = undefined
      })
    }
  }, [getInviteCode, setInviteCode])

  return inviteCode
}

export const useInviteBonus = () => {
  const { showDialog } = useDialog()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const propSuffix = usePropSuffix()
  const [collected, setCollected] = useUserProperty(collectedProp + propSuffix)

  const getCanCollect = useCallback(async () => {
    try {
      const { account } = goodWallet
      const statuses = await goodWallet.canCollectBountyFor([account])

      return statuses[account]
    } catch (e) {
      log.error('useInviteBonus: failed to get canCollect:', e.message, e)
      return false
    }
  }, [goodWallet])

  // collect one time bonus as invitee
  const collectInviteBounty = useCallback(
    async (onUnableToCollect = noop) => {
      if (collected) {
        return false
      }

      const canCollect = await getCanCollect()

      log.debug(`useInviteBonus: got canCollect:`, { canCollect })

      if (!canCollect) {
        onUnableToCollect()
        return false
      }

      showDialog({
        image: <LoadingIcon />,
        loading: true,
        message: t`Please wait` + '\n' + t`This might take a few seconds...`,
        showButtons: false,
        title: t`Collecting Invite Reward`,
        showCloseButtons: false,
        onDismiss: noop,
      })

      await goodWallet.collectInviteBounty()
      setCollected(true)

      log.debug(`useInviteBonus: invite bonty collected`)

      showDialog({
        title: t`Reward Collected!`,
        image: <SuccessIcon />,
        buttons: [
          {
            text: t`YAY!`,
          },
        ],
      })
      return true
    },
    [showDialog, collected, goodWallet, userStorage, propSuffix],
  )

  return [collected, getCanCollect, collectInviteBounty]
}

export const useCollectBounty = () => {
  const { showDialog, showErrorDialog } = useDialog()
  const [canCollect, setCanCollect] = useState(undefined)
  const [collected, setCollected] = useState(undefined)
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const propSuffix = usePropSuffix()
  const collect = async () => {
    const labels = {
      title: t`Collecting Bonus`,
      message: t`Collecting invite bonus for ${canCollect} invited friends`,
    }
    try {
      showDialog({
        ...labels,
        loading: true,
      })

      log.debug('useCollectBounty calling collectInviteBounties', { canCollect })
      const collected = await goodWallet.collectInviteBounties()
      if (!collected) {
        return
      }
      setCanCollect(0)
      fireEvent(INVITE_BOUNTY, { from: 'inviter', numCollected: canCollect })
      userStorage.userProperties.safeSet(collectedProp + propSuffix, true)
      setCollected(true)
      await checkBounties() //after collectinng check how much left to collect
      showDialog({
        ...labels,
        loading: false,
      })
    } catch (e) {
      const { message } = e
      const uiMessage = decorate(e, ExceptionCode.E15)

      log.error('failed collecting invite bounty', message, e, {
        inviter: goodWallet.account,
        canCollect,
        dialogShown: true,
      })

      showErrorDialog(t`Failed collecting invite bounty.`, uiMessage)
    }
  }

  const checkBounties = async () => {
    try {
      const { totalPendingBounties } = await goodWallet.getUserInvites(goodWallet.account)

      log.debug('checkBounties got pending invites:', { totalPendingBounties })
      if (totalPendingBounties > 0 && (await goodWallet.isCitizen()) === false) {
        log.debug('checkBounties inviter not whitelisted')
        showErrorDialog(t`Can't collect invite bonus. You need to first complete your Face Verification.`)
        return
      }

      log.debug('checkBounties:', { totalPendingBounties })
      setCanCollect(totalPendingBounties)
    } catch (e) {
      log.error('checkBounties failed:', e.message, e)
    } finally {
      setCollected(false)
    }
  }

  useEffect(() => {
    checkBounties()
  }, [])

  useEffect(() => {
    if (canCollect > 0) {
      collect()
    }
  }, [canCollect])

  return [canCollect, collected]
}

export const useInvited = () => {
  const [data, setData] = useState()
  const [invites, setInvites] = useState([])
  const goodWallet = useWallet()

  const { toDecimals } = useFormatG$()

  const { level, totalEarned } = data || {}

  const updateData = useCallback(async () => {
    try {
      const { user, level } = await goodWallet.getUserInviteBounty()
      const totalEarned = decimalsToFixed(toDecimals(user.totalEarned))
      const invitesData = { level, totalEarned }

      setData(invitesData)
      log.debug('set invitesData to', { invitesData, user })
    } catch (e) {
      log.error('set invitesData failed:', e.message, e)
      throw e
    }
  }, [setData, goodWallet])

  const updateInvited = useCallback(async () => {
    try {
      await updateData()

      const { invitees, pending } = await goodWallet.getUserInvites()

      log.debug('updateInvited got invitees and pending invitees', { invitees, pending })

      let invited = invitees.map(addr => ({
        address: addr,
      }))
      let isPending = keyBy(pending)

      invited.forEach(i => (i.status = isPending[i.address] ? 'pending' : 'approved'))
      setInvites(invited)

      log.debug('set invitees to', { invitees })
    } catch (e) {
      log.error('updateInvited failed:', e.message, e)
    }
  }, [setInvites, updateData, goodWallet])

  useEffect(() => {
    updateInvited()
  }, [updateInvited, goodWallet.networkId])

  const { pending = [], approved = [] } = useMemo(() => groupBy(invites, 'status'), [invites])

  return [invites, updateInvited, level, { pending: pending.length, approved: approved.length, totalEarned }]
}

export const useInviteScreenOpened = () => {
  const userStorage = useUserStorage()

  const { userProperties } = userStorage

  const [wasOpened, setWasOpened] = useState(userProperties.get(wasOpenedProp))

  const trackOpened = useCallback(() => {
    if (wasOpened) {
      return
    }

    userProperties.safeSet(wasOpenedProp, true)
    setWasOpened(true)
  }, [setWasOpened])

  useEffect(() => {
    trackOpened()
  }, [])

  return { wasOpened, trackOpened }
}

export const useInviteCopy = () => {
  const [, , level] = useInvited()
  const { toDecimals } = useFormatG$()
  const bounty = decimalsToFixed(toDecimals(get(level, 'bounty', 0)))

  return {
    copy: t`Invite a friend to earn ${bounty} G$ after they${isWeb ? '\n' : ' '}claim. They will also earn a ${bounty /
      2} G$ bonus.`,
  }
}

export const useInviteShare = level => {
  const posthog = usePostHog()
  const abTestOptions = useMemo(() => (posthog ? posthog.getFeatureFlagPayload('share-link') : []), [posthog])
  const abTestOption = useOption(abTestOptions) || {}
  const { shareTitle } = abTestOption
  const { toDecimals } = useFormatG$()

  const bounty = useMemo(() => (level?.bounty ? decimalsToFixed(toDecimals(level.bounty)) : ''), [level])

  const abTestMessage = useMemo(() => {
    const { shareMessage: value } = abTestOption || {}

    if (value) {
      const reward = bounty / 2

      return mustache(value, { bounty, reward })
    }
  }, [abTestOption, bounty])

  const inviteCode = useInviteCode()
  const shareUrl = useMemo(
    () =>
      inviteCode && abTestOption
        ? `${Config.invitesUrl}?inviteCode=${inviteCode}&utm_campaign=${abTestOption.id || 'default'}`
        : '',
    [inviteCode, abTestOption],
  )

  const share = useMemo(() => generateShareObject(shareTitle, abTestMessage, shareUrl), [
    shareTitle,
    shareUrl,
    abTestMessage,
  ])

  return { share, shareUrl, shareTitle, bounty }
}
