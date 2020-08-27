import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import Text from '../../common/view/Text'
import userStorage from '../../../lib/gundb/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'
import API from '../../../lib/API/api'
import { CLAIM_QUEUE, fireEvent } from '../../../lib/analytics/analytics'
import useLoadingIndicator from '../../../lib/hooks/useLoadingIndicator'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import { showQueueDialog } from '../../common/dialogs/showQueueDialog'
import Config from '../../../config/config'
import logger from '../../../lib/logger/pino-logger'
import claimQueueIllustration from '../../../assets/Claim/claimQueue.svg'

const log = logger.child({ from: 'useClaimQueue' })
const isQueueDisabled = !Config.claimQueue

const ClaimQueuePopupText = ({ styles }) => (
  <View style={styles.wrapper}>
    <View style={styles.title}>
      <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
        You’re in the queue to start claiming GoodDollars!
      </Text>
    </View>
    <View style={styles.paddingVertical20}>
      <Text style={styles.textStyle}>We’ll email you as soon as it’s your turn to claim G$’s.</Text>
      <Text style={[styles.textStyle, styles.paddingTop20, styles.boldFont]}>
        {'And always remember:\nGood things come to those who wait :)'}
      </Text>
    </View>
  </View>
)

export default () => {
  const [queueStatus, setQueueStatus] = useState(userStorage.userProperties.get('claimQueueAdded'))
  const [showLoading, hideLoading] = useLoadingIndicator()
  const [, hideDialog, showErrorDialog] = useDialog()

  const checkQueueStatus = useCallback(
    async (addToQueue = false) => {
      //user already whitelisted
      const isCitizen = await goodWallet.isCitizen()
      if (isCitizen) {
        setQueueStatus({ status: 'approved' })
        return { status: 'approved' }
      }
      const inQueue = userStorage.userProperties.get('claimQueueAdded')
      if (inQueue) {
        setQueueStatus(inQueue)
      }

      log.debug('queue status from userproperties:', { inQueue })
      if (get(inQueue, 'status') === 'pending' || addToQueue) {
        const {
          data: { ok, queue },
        } = await API.checkQueueStatus()

        const curStatus = inQueue && inQueue.status

        //send event in case user was added to queue or his queue status has changed
        if (ok === 1 || queue.status !== curStatus) {
          fireEvent(CLAIM_QUEUE, { status: queue.status })
          await userStorage.userProperties.set('claimQueueAdded', queue)
        }

        log.debug('queue stats from api:', { queue })
        setQueueStatus(queue)
        return queue
      }
    },
    [setQueueStatus],
  )

  const handleClaim = async onSuccess => {
    try {
      showLoading(true)

      //if user has no queue status, we try to add him to queue
      let { status } = queueStatus || (await checkQueueStatus(true)) || {}

      //this will only trigger the first time, since in subsequent loads claim button is disabled
      if (status === 'pending') {
        showQueueDialog(ClaimQueuePopupText, { buttonText: 'OK, I’ll WAIT', imageSource: claimQueueIllustration })
        return false
      }
      return true
    } catch (e) {
      log.error('handleClaimQueue failed', e.message, e, { dialogShown: true })
      showSupportDialog(showErrorDialog, hideDialog, null, 'We could not get the Claim queue status')
      return false
    } finally {
      hideLoading()
    }
  }

  const initializeQueue = async () => {
    try {
      await checkQueueStatus()
    } catch (exception) {
      const { message } = exception

      log.error('checkQueueStatus API request failed', message, exception)
    }
  }

  useEffect(() => {
    if (isQueueDisabled) {
      setQueueStatus({ status: 'approved' })
      return
    }

    initializeQueue()
  }, [])

  return { queueStatus, handleClaim }
}
