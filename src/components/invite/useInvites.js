import { useCallback, useEffect, useState } from 'react'
import { groupBy, keyBy } from 'lodash'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'
import { decorate, ExceptionCode } from '../../lib/logger/exceptions'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { INVITE_CODE } from '../../lib/constants/localStorage'

import Config from '../../config/config'

const wasOpenedProp = 'hasOpenedInviteScreen'

const log = logger.child({ from: 'useInvites' })

const registerForInvites = async () => {
  const inviterInviteCode =
    userStorage.userProperties.get('inviterInviteCode') || (await AsyncStorage.getItem(INVITE_CODE))

  let hasJoined = false
  try {
    if (inviterInviteCode) {
      hasJoined = await goodWallet.hasJoinedInvites()
      !hasJoined && fireEvent(INVITE_JOIN, { inviterInviteCode })
    }
    log.debug('joining invites contract:', { inviterInviteCode })
    const inviteCode = await goodWallet.joinInvites(inviterInviteCode)
    log.debug('joined invites contract:', { inviteCode, inviterInviteCode })

    //this is a fix for a bug that users didnt register correctly. so didnt collect bounty on first claim.
    if (!hasJoined && (await goodWallet.isCitizen())) {
      log.debug('joined invites. user already whitelisted. collecting bounty...')
      await goodWallet.collectInviteBounty()
    }

    userStorage.userProperties.set('inviteCode', inviteCode)
    return inviteCode
  } catch (e) {
    log.error('registerForInvites failed', e.message, e, { inviterInviteCode })
  }
}

const getInviteCode = async () => {
  let code = userStorage.userProperties.get('inviteCode')

  if (!code) {
    code = await registerForInvites()
  }

  return code
}

const useInviteCode = () => {
  const [inviteCode, setInviteCode] = useState(userStorage.userProperties.get('inviteCode'))

  //return user invite code or register him with a new code

  useEffect(() => {
    log.debug('useInviteCode didmount:', { inviteCode })

    if (Config.enableInvites && !inviteCode) {
      getInviteCode().then(code => {
        log.debug('useInviteCode registered user result:', { code })
        setInviteCode(code)
      })
    }
  }, [])

  return inviteCode
}

const useCollectBounty = () => {
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

      fireEvent(INVITE_BOUNTY, { numCollected: canCollect })
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

  log.debug({ canCollect, collected })
  return [canCollect, collected]
}

const useInvited = () => {
  const [invites, setInvites] = useState([])
  const [level, setLevel] = useState({})
  const [totalEarned, setTotalEarned] = useState(0)

  const updateData = async () => {
    const user = await goodWallet.invitesContract.methods.users(goodWallet.account).call()

    const level = await goodWallet.invitesContract.methods.levels(user.level).call()
    setLevel(level)
    setTotalEarned(user.totalEarned.toNumber() / 100) //convert from wei to decimals
  }

  const updateInvited = async () => {
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
  }

  useEffect(() => {
    updateInvited()
  }, [])

  const { pending = [], approved = [] } = groupBy(invites, 'status')

  return [invites, updateInvited, level, { pending: pending.length, approved: approved.length, totalEarned }]
}

const useInviteScreenOpened = () => {
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

export { useInviteCode, useInvited, useCollectBounty, useInviteScreenOpened }
