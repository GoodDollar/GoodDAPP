import { useCallback, useEffect, useState } from 'react'
import { defaults, find, groupBy, keyBy, uniqBy } from 'lodash'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'
import { decorate, ExceptionCode } from '../../lib/logger/exceptions'
import Config from '../../config/config'

const log = logger.child({ from: 'useInvites' })
const defaultLastInviteState = { pending: 0, approved: 0 }

const registerForInvites = async () => {
  const inviterInviteCode = userStorage.userProperties.get('inviterInviteCode')

  if (inviterInviteCode) {
    fireEvent(INVITE_JOIN, { inviterInviteCode })
  }

  try {
    log.debug('joining invites contract:', { inviterInviteCode })
    const inviteCode = await goodWallet.joinInvites(inviterInviteCode)
    log.debug('joined invites contract:', { inviteCode, inviterInviteCode })
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
  const [initialized, setInitialized] = useState(false)
  const [invitees, setInvitees] = useState([])
  const [level, setLevel] = useState({})
  const [totalEarned, setTotalEarned] = useState(0)
  const [lastState, setLastState] = useState(defaultLastInviteState)

  const { pending = [], approved = [] } = groupBy(invitees, 'status')
  const inviteState = { pending: pending.length, approved: approved.length, totalEarned }

  const clearLastState = useCallback(() => {
    if (!initialized) {
      return
    }

    setLastState(inviteState)
    userStorage.userProperties.set('lastInviteState', inviteState)
  }, [initialized, inviteState, setLastState])

  const refresh = useCallback(async () => {
    try {
      let cached = userStorage.userProperties.get('cachedInvites') || []

      log.debug('updateInvited', { cached })
      setInvitees(cached)

      const [invitees, pending] = await Promise.all([
        goodWallet.invitesContract.methods.getInvitees(goodWallet.account).call(),
        goodWallet.invitesContract.methods
          .getPendingInvitees(goodWallet.account)
          .call()
          .then(keyBy),
      ])

      log.debug('updateInvited got invitees and pending invitees', { invitees, pending })

      let invited = await Promise.all(
        invitees.map(addr => userStorage.getUserProfile(addr).then(profile => ({ addr, ...profile }))),
      )

      log.debug('updateInvited got invitees profiles', { invited })

      // keep if both name + avatar or not in cache
      invited.filter(({ name, avatar, addr }) => {
        if (name || avatar) {
          return true
        }

        return !find(cached, { addr })
      })

      // adding/updating invitees profiles to cache
      cached = uniqBy(invited.concat(cached), 'addr')

      // calculcate statuses
      cached = cached.map(item => {
        const { addr } = item
        const status = pending[addr] ? 'pending' : 'approved'

        return {
          ...item,
          status,
        }
      })

      setInvitees(cached)
      userStorage.userProperties.set('cachedInvites', cached)
    } catch (e) {
      log.error('updateInvited failed:', e.message, e)
    }
  }, [setInvitees])

  useEffect(() => {
    const updateData = async () => {
      try {
        const user = await goodWallet.invitesContract.methods.users(goodWallet.account).call()
        const level = await goodWallet.invitesContract.methods.levels(user.level).call()

        setLevel(level)
        setTotalEarned(user.totalEarned.toNumber() / 100) //convert from wei to decimals
      } catch (e) {
        log.error('updateData failed:', e.message, e)
      }
    }

    setLastState(defaults(userStorage.userProperties.get('lastInviteState') || {}, defaultLastInviteState))

    Promise.all([updateData(), refresh()]).finally(() => setInitialized(true))
  }, [])

  return { invitees, refresh, level, inviteState, lastState, clearLastState, initialized }
}

export { useInviteCode, useInvited, useCollectBounty }
