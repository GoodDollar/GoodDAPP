import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { filter, groupBy, keys, noop, values } from 'lodash'
import { t } from '@lingui/macro'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { useDialog } from '../../lib/dialog/useDialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'
import { decorate, ExceptionCode } from '../../lib/exceptions/utils'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { INVITE_CODE } from '../../lib/constants/localStorage'

import Config from '../../config/config'
import SuccessIcon from '../common/modal/SuccessIcon'
import LoadingIcon from '../common/modal/LoadingIcon'
import { useUserProperty } from '../../lib/userStorage/useProfile'

const log = logger.child({ from: 'useInvites' })

const collectedProp = 'inviteBonusCollected'
const wasOpenedProp = 'hasOpenedInviteScreen'

export const useRegisterForInvites = () => {
  const userStorage = useUserStorage()
  const goodWallet = useWallet()

  const registerForInvites = useCallback(
    async inviterInviteCode => {
      const { userProperties } = userStorage
      let code = userProperties.get('inviteCode')
      let usedInviterCode = userProperties.get('inviterInviteCodeUsed')

      // if already have code and already set inviter or dont have one just return
      if (code && (usedInviterCode || !inviterInviteCode)) {
        return code
      }

      log.debug('joining invites contract:', { inviterInviteCode })

      try {
        const inviteCode = await goodWallet.joinInvites(inviterInviteCode)

        log.debug('joined invites contract:', { inviteCode, inviterInviteCode })
        userProperties.safeSet('inviteCode', inviteCode)

        // in case we were invited fire event
        if (inviterInviteCode && !usedInviterCode) {
          fireEvent(INVITE_JOIN, { inviterInviteCode })

          userProperties.safeSet({
            inviterInviteCodeUsed: true,
            inviterInviteCode: inviterInviteCode,
          })
        }

        return inviteCode
      } catch (e) {
        log.error('registerForInvites failed', e.message, e, { inviterInviteCode })
      }
    },
    [userStorage, goodWallet],
  )

  return registerForInvites
}

export const useInviteCode = () => {
  const userStorage = useUserStorage()
  const registerForInvites = useRegisterForInvites()

  const inviteCodePromiseRef = useRef()
  const [inviteCode, setInviteCode] = useState()

  const getInviteCode = useCallback(async () => {
    const inviterInviteCode =
      userStorage.userProperties.get('inviterInviteCode') || (await AsyncStorage.getItem(INVITE_CODE))
    const code = await registerForInvites(inviterInviteCode)

    return code
  }, [registerForInvites])

  useEffect(() => {
    setInviteCode(userStorage.userProperties.get('inviteCode'))
  }, [userStorage, setInviteCode])

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
  const collected = useUserProperty(collectedProp)
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

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
      userStorage.userProperties.safeSet(collectedProp, true)

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
    [showDialog, collected, goodWallet, userStorage],
  )

  return [collected, getCanCollect, collectInviteBounty]
}

export const useCollectBounty = () => {
  const { showDialog, showErrorDialog } = useDialog()
  const [canCollect, setCanCollect] = useState(undefined)
  const [collected, setCollected] = useState(undefined)
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

  const collect = async () => {
    try {
      showDialog({
        title: t`Collecting Bonus`,
        message: t`Collecting invite bonus for ${canCollect} invited friends`,
        loading: true,
      })

      log.debug('useCollectBounty calling collectInviteBounties', { canCollect })
      await goodWallet.collectInviteBounties()

      fireEvent(INVITE_BOUNTY, { from: 'inviter', numCollected: canCollect })
      userStorage.userProperties.safeSet(collectedProp, true)
      setCollected(true)

      showDialog({
        title: 'Collecting Bonus',
        message: t`Collecting invite bonus for ${canCollect} invited friends`,
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
      const invites = await goodWallet.getUserInvites(goodWallet.account)
      const pending = keys(invites.pending)

      log.debug('checkBounties got pending invites:', { pending })

      if (pending.length > 0 && (await goodWallet.isCitizen()) === false) {
        log.debug('checkBounties inviter not whitelisted')
        showErrorDialog(t`Can't collect invite bonus. You need to first complete your Face Verification.`)
        return
      }

      const statuses = await goodWallet.canCollectBountyFor(pending)
      const hasBounty = filter(values(statuses))

      log.debug('checkBounties:', { hasBounty, pending })
      setCanCollect(hasBounty.length)
    } catch (e) {
      log.error('checkBounties failed:', e.message, e)
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

  const { level, totalEarned } = data || {}

  const updateData = useCallback(async () => {
    try {
      const { user, level } = await goodWallet.getUserInviteBounty()
      const totalEarned = parseInt(user.totalEarned) / 100
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

      invited.forEach(i => (i.status = pending[i.address] ? 'pending' : 'approved'))
      setInvites(invited)

      log.debug('set invitees to', { invitees })
    } catch (e) {
      log.error('updateInvited failed:', e.message, e)
    }
  }, [setInvites, updateData, goodWallet])

  useEffect(() => {
    updateInvited()
  }, [updateInvited])

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
