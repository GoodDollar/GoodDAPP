import { useEffect, useState } from 'react'
import { keyBy, uniqBy } from 'lodash'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { useDialog } from '../../lib/undux/utils/dialog'
import { fireEvent, INVITE_BOUNTY, INVITE_JOIN } from '../../lib/analytics/analytics'

const log = logger.child({ from: 'useInvites' })

const registerForInvites = async () => {
  const inviterCode = userStorage.userProperties.get('inviterCode')
  if (inviterCode) {
    fireEvent(INVITE_JOIN, { inviterCode })
  }
  const inviteCode = await goodWallet.joinInvites(inviterCode)
  log.debug('joined invites contract:', { inviteCode, inviterCode })
  userStorage.userProperties.set('inviteCode', inviteCode)
  return inviteCode
}

export const getInviteCode = async () => {
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
    if (!inviteCode) {
      getInviteCode().then(code => setInviteCode(code))
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
      await goodWallet.collectInviteBounties()
      fireEvent(INVITE_BOUNTY, { numCollected: canCollect })
      setCollected(true)
      showDialog({
        title: 'Collecting Bonus',
        message: `Collecting invite bonus for ${canCollect} invited friends`,
        loading: false,
      })
    } catch (e) {
      log.error('failed collecting invite bounties', e.message, e, { inviter: goodWallet.account })
      showErrorDialog('Failed collecting invite bonus. You need to first complete your Face Verification.')
    }
  }

  const checkBounties = async () => {
    let pending = await goodWallet.invitesContract.methods.getPendingInvitees(goodWallet.account).call()

    let hasBounty = await Promise.all(
      pending.map(a => goodWallet.invitesContract.methods.canCollectBountyFor(a).call()),
    ).then(_ => _.filter(x => x))

    log.debug('checkBounties:', { hasBounty, pending })
    setCanCollect(hasBounty.length)
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

  const updateInvited = async () => {
    let cached = (await AsyncStorage.getItem('GD_cachedInvites')) || []
    setInvites(cached)
    const [invitees, pending] = await Promise.all([
      goodWallet.invitesContract.methods.getInvitees(goodWallet.account).call(),
      goodWallet.invitesContract.methods
        .getPendingInvitees(goodWallet.account)
        .call()
        .then(_ => keyBy(_)),
    ])
    let invited = await Promise.all(
      invitees.map(addr => userStorage.getUserProfile(addr).then(profile => ({ addr, ...profile }))),
    )

    log.debug({ invitees, pending, invited, cached })

    //keep if both name + avatar or not in cache
    invited = invited.filter(_ => _.name || _.avatar || cached.find(c => c.addr === _.addr) === undefined)

    cached = uniqBy(invited.concat(cached), 'addr')
    cached.forEach(i => (i.status = pending[i.addr] ? 'pending' : 'approved'))
    setInvites(cached)
    AsyncStorage.setItem('GD_cachedInvites', cached)
  }

  useEffect(() => {
    updateInvited()
  }, [])

  return [invites, updateInvited]
}

export { useInviteCode, useInvited, useCollectBounty }
