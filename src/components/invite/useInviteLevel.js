import { useEffect } from 'react'
import { useStoreProp } from '../../lib/undux/GDStore'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'useInviteLevel' })

const useInviteLevel = () => {
  const [inviteLevel, setInviteLevel] = useStoreProp('inviteLevel')

  const updateData = async () => {
    try {
      const user = await goodWallet.invitesContract.methods.users(goodWallet.account).call()
      const level = await goodWallet.invitesContract.methods.levels(user.level).call()
      setInviteLevel(level)
      log.debug('set inviteLevel to', { level })
    } catch (e) {
      log.error('setInviteLevel failed:', e.message, e)
    }
  }

  useEffect(() => {
    updateData()
  }, [])

  return inviteLevel
}
export default useInviteLevel
