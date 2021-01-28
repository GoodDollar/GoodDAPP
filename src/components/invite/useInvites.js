import { useEffect, useState } from 'react'
import { groupBy, keyBy, uniqBy } from 'lodash'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { useDialog } from '../../lib/undux/utils/dialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'
import { decorate, ExceptionCode } from '../../lib/logger/exceptions'
import Config from '../../config/config'

const log = logger.child({ from: 'useInvites' })

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
      let cached = (await AsyncStorage.getItem('GD_cachedInvites')) || []
      log.debug('updateInvited', { cached })
      setInvites(cached)

      const [invitees, pending] = await Promise.all([
        goodWallet.invitesContract.methods.getInvitees(goodWallet.account).call(),
        goodWallet.invitesContract.methods
          .getPendingInvitees(goodWallet.account)
          .call()
          .then(_ => keyBy(_)),
      ])
      log.debug('updateInvited got invitees and pending invitees', { invitees, pending })

      let invited = await Promise.all(
        invitees.map(addr => userStorage.getUserProfile(addr).then(profile => ({ addr, ...profile }))),
      )

      log.debug('updateInvited got invitees profiles', { invited })

      //keep if both name + avatar or not in cache
      invited = invited.filter(_ => _.name || _.avatar || cached.find(c => c.addr === _.addr) === undefined)

      //adding/updating invitees profiles to cache
      cached = uniqBy(invited.concat(cached), 'addr')
      cached.forEach(i => (i.status = pending[i.addr] ? 'pending' : 'approved'))
      setInvites(cached)
      AsyncStorage.setItem('GD_cachedInvites', cached)
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

export { useInviteCode, useInvited, useCollectBounty }
