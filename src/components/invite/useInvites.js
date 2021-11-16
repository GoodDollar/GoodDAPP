import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { groupBy, keyBy, noop } from 'lodash'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/userStorage/UserStorage'
import logger from '../../lib/logger/js-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'
import { decorate, ExceptionCode } from '../../lib/logger/exceptions'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { INVITE_CODE } from '../../lib/constants/localStorage'

import Config from '../../config/config'
import SuccessIcon from '../common/modal/SuccessIcon'
import LoadingIcon from '../common/modal/LoadingIcon'
import { useUserProperty } from '../../lib/userStorage/useProfile'

const log = logger.child({ from: 'useInvites' })

const collectedProp = 'inviteBonusCollected'
const wasOpenedProp = 'hasOpenedInviteScreen'

export const registerForInvites = async inviterInviteCode => {
  let code = userStorage.userProperties.get('inviteCode')
  let usedInviterCode = userStorage.userProperties.get('inviterInviteCodeUsed')

  //if already have code and already set inviter or dont have one just return
  if (code && (usedInviterCode || !inviterInviteCode)) {
    return code
  }

  try {
    log.debug('joining invites contract:', { inviterInviteCode })
    const inviteCode = await goodWallet.joinInvites(inviterInviteCode)
    log.debug('joined invites contract:', { inviteCode, inviterInviteCode })
    userStorage.userProperties.set('inviteCode', inviteCode)

    //in case we were invited fire event
    if (inviterInviteCode) {
      fireEvent(INVITE_JOIN, { inviterInviteCode })
      userStorage.userProperties.updateAll({ inviterInviteCodeUsed: true, inviterInviteCode: inviterInviteCode })
    }

    return inviteCode
  } catch (e) {
    log.error('registerForInvites failed', e.message, e, { inviterInviteCode })
  }
}

const getInviteCode = async () => {
  const inviterInviteCode =
    userStorage.userProperties.get('inviterInviteCode') || (await AsyncStorage.getItem(INVITE_CODE))
  const code = await registerForInvites(inviterInviteCode)

  return code
}

let _inviteCodePromise
export const useInviteCode = () => {
  const [inviteCode, setInviteCode] = useState(userStorage.userProperties.get('inviteCode'))

  //return user invite code or register him with a new code

  useEffect(() => {
    log.debug('useInviteCode didmount:', { inviteCode })

    if (Config.enableInvites) {
      if (!_inviteCodePromise) {
        _inviteCodePromise = getInviteCode()
      }

      _inviteCodePromise.then(code => {
        log.debug('useInviteCode registered user result:', { code })
        setInviteCode(code)
        _inviteCodePromise = undefined
      })
    }
  }, [])

  return inviteCode
}

export const useInviteBonus = () => {
  const [showDialog] = useDialog()
  const collected = useUserProperty(collectedProp)

  const getCanCollect = useCallback(async () => {
    try {
      return await goodWallet.invitesContract.methods.canCollectBountyFor(goodWallet.account).call()
    } catch (e) {
      log.error('useInviteBonus: failed to get canCollect:', e.message, e)
      return false
    }
  }, [])

  const collectInviteBounty = useCallback(
    async (onUnableToCollect = noop) => {
      if (collected) {
        return
      }

      const canCollect = await getCanCollect()

      log.debug(`useInviteBonus: got canCollect:`, { canCollect })

      if (!canCollect) {
        onUnableToCollect()
        return
      }

      showDialog({
        image: <LoadingIcon />,
        loading: true,
        message: 'Please wait\nThis might take a few seconds...',
        showButtons: false,
        title: `Collecting Invite Reward`,
        showCloseButtons: false,
        onDismiss: noop,
      })

      await goodWallet.collectInviteBounty()
      userStorage.userProperties.set(collectedProp, true)

      log.debug(`useInviteBonus: invite bonty collected`)

      showDialog({
        title: `Reward Collected!`,
        image: <SuccessIcon />,
        buttons: [
          {
            text: 'YAY!',
          },
        ],
      })
    },
    [showDialog, collected],
  )

  return [collected, getCanCollect, collectInviteBounty]
}

export const useCollectBounty = () => {
  const [showDialog, , showErrorDialog] = useDialog()
  const [canCollect, setCanCollect] = useState(undefined)
  const [collected, setCollected] = useState(undefined)

  const collect = async () => {
    try {
      showDialog({
        title: 'Collecting Bonus',
        message: `Collecting invite bonus for ${canCollect} invited friends`,
        loading: true,
      })

      log.debug('useCollectBounty calling collectInviteBounties', { canCollect })
      await goodWallet.collectInviteBounties()

      fireEvent(INVITE_BOUNTY, { from: 'inviter', numCollected: canCollect })
      userStorage.userProperties.set(collectedProp, true)
      setCollected(true)

      showDialog({
        title: 'Collecting Bonus',
        message: `Collecting invite bonus for ${canCollect} invited friends`,
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

      showErrorDialog('Failed collecting invite bounty.', uiMessage)
    }
  }

  const checkBounties = async () => {
    try {
      let pending = await goodWallet.invitesContract.methods.getPendingInvitees(goodWallet.account).call()
      log.debug('checkBounties got pending invites:', { pending })

      if (pending.length > 0 && (await goodWallet.isCitizen()) === false) {
        log.debug('checkBounties inviter not whitelisted')
        showErrorDialog(`Can't collect invite bonus. You need to first complete your Face Verification.`)
        return
      }

      let hasBounty = await Promise.all(
        pending.map(a => goodWallet.invitesContract.methods.canCollectBountyFor(a).call()),
      ).then(_ => _.filter(x => x))
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
  const { level, totalEarned } = data || {}

  const updateData = useCallback(async () => {
    try {
      const user = await goodWallet.invitesContract.methods.users(goodWallet.account).call()
      const level = await goodWallet.invitesContract.methods.levels(user.level).call()
      const totalEarned = parseInt(user.totalEarned) / 100
      const invitesData = { level, totalEarned }

      setData(invitesData)
      log.debug('set invitesData to', invitesData)
    } catch (e) {
      log.error('set invitesData failed:', e.message, e)
      throw e
    }
  }, [setData])

  const updateInvited = useCallback(async () => {
    try {
      await updateData()

      const [invitees, pending] = await Promise.all([
        goodWallet.invitesContract.methods.getInvitees(goodWallet.account).call(),
        goodWallet.invitesContract.methods
          .getPendingInvitees(goodWallet.account)
          .call()
          .then(_ => keyBy(_)),
      ])
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
  }, [setInvites, updateData])

  useEffect(() => {
    updateInvited()
  }, [updateInvited])

  const { pending = [], approved = [] } = useMemo(() => groupBy(invites, 'status'), [invites])

  return [invites, updateInvited, level, { pending: pending.length, approved: approved.length, totalEarned }]
}

export const useInviteScreenOpened = () => {
  const { userProperties } = userStorage

  const [wasOpened, setWasOpened] = useState(userProperties.get(wasOpenedProp))

  const trackOpened = useCallback(() => {
    if (wasOpened) {
      return
    }

    userProperties.set(wasOpenedProp, true)
    setWasOpened(true)
  }, [setWasOpened])

  useEffect(() => {
    trackOpened()
  }, [])

  return { wasOpened, trackOpened }
}
