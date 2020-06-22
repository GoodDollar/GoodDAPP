import { useCallback, useEffect, useState } from 'react'
import userStorage from '../../../lib/gundb/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'
import API from '../../../lib/API/api'
import { CLAIM_QUEUE, fireEvent } from '../../../lib/analytics/analytics'
import useLoadingIndicator from '../../../lib/hooks/useLoadingIndicator'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import showQueueDialog from '../../common/dialogs/queueDialog'

import Config from '../../../config/config'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'useClaimQueue' })
export default () => {
  const [queueStatus, setQueueStatus] = useState(undefined)
  const [showLoading, hideLoading] = useLoadingIndicator()
  const [showDialog, hideDialog, showErrorDialog] = useDialog()

  const checkQueueStatus = useCallback(
    async (addToQueue = false) => {
      //user already whitelisted
      const isCitizen = await goodWallet.isCitizen()
      if (isCitizen) {
        return
      }
      const inQueue = await userStorage.userProperties.get('claimQueueAdded')
      if (inQueue) {
        setQueueStatus(inQueue)
      }

      log.debug('CLAIM', { inQueue })
      if (inQueue || addToQueue) {
        const {
          data: { ok, queue },
        } = await API.checkQueueStatus()

        const curStatus = inQueue && inQueue.status

        //send event in case user was added to queue or his queue status has changed
        if (ok === 1 || queue.status !== curStatus) {
          fireEvent(CLAIM_QUEUE, { status: queue.status })
        }

        log.debug('CLAIM', { queue })
        if (inQueue == null) {
          userStorage.userProperties.set('claimQueueAdded', queue)
        }
        setQueueStatus(queue)
        return queue
      }
    },
    [setQueueStatus]
  )

  const handleClaim = async onSuccess => {
    try {
      showLoading(true)

      //if user has no queue status, we try to add him to queue
      let { status } = queueStatus || (await checkQueueStatus(true)) || {}

      if (status === 'pending') {
        showQueueDialog(showDialog)
        return false
      }
      return true
    } catch (e) {
      log.error('handleClaimQueue failed', e.message, e)
      showSupportDialog(showErrorDialog, hideDialog, null, 'We could not get the Claim queue status')
      return false
    } finally {
      hideLoading()
    }
  }

  useEffect(() => {
    if (Config.claimQueue) {
      checkQueueStatus().catch(e => log.error('checkQueueStatus API request failed', e.message, e))
    } else {
      setQueueStatus({ status: 'approved' })
    }
  }, [])

  return { queueStatus, handleClaim }
}
