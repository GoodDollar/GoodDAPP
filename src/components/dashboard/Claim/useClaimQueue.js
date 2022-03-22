import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import { Trans as _, t } from '@lingui/macro'
import Text from '../../common/view/Text'
import userStorage from '../../../lib/userStorage/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'
import API from '../../../lib/API/api'
import { CLAIM_QUEUE, fireEvent } from '../../../lib/analytics/analytics'
import useLoadingIndicator from '../../../lib/hooks/useLoadingIndicator'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import { showQueueDialog } from '../../common/dialogs/showQueueDialog'
import Config from '../../../config/config'
import logger from '../../../lib/logger/js-logger'
import claimQueueIllustration from '../../../assets/Claim/claimQueue.svg'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'

const log = logger.child({ from: 'useClaimQueue' })
const isQueueDisabled = !Config.claimQueue

const ClaimQueuePopupText = ({ styles }) => (
  <View style={styles.wrapper}>
    <View style={styles.title}>
      <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
        <_>You’re in the queue to start claiming GoodDollars!</_>
      </Text>
    </View>
    <View style={styles.paddingVertical20}>
      <Text style={styles.textStyle}>
        <_>We’ll email you as soon as it’s your turn to claim G$’s.</_>
      </Text>
      <Text style={[styles.textStyle, styles.paddingTop20, styles.boldFont]}>
        <_>{'And always remember:\nGood things come to those who wait :)'}</_>
      </Text>
    </View>
  </View>
)

export default () => {
  const { userProperties } = userStorage
  const [queueStatus, setQueueStatus] = useState(userProperties.get('claimQueueAdded'))
  const [showLoading, hideLoading] = useLoadingIndicator()
  const [, hideDialog, showErrorDialog] = useDialog()
  const { setDialogBlur } = useContext(GlobalTogglesContext)

  const checkQueueStatus = useCallback(
    async (addToQueue = false) => {
      // user already whitelisted
      const isCitizen = await goodWallet.isCitizen()

      if (isCitizen) {
        setQueueStatus({ status: 'approved' })
        return { status: 'approved' }
      }

      const inQueue = userProperties.get('claimQueueAdded')
      const currentStatus = get(inQueue, 'status')

      if (inQueue) {
        setQueueStatus(inQueue)
      }

      log.debug('queue status from userproperties:', { inQueue })

      if (addToQueue || currentStatus === 'pending') {
        const {
          data: { ok, queue },
        } = await API.checkQueueStatus()

        // send event in case user was added to queue or his queue status has changed
        if (ok === 1 || queue.status !== currentStatus) {
          const { status } = queue

          fireEvent(CLAIM_QUEUE, { status })
          await userProperties.set('claimQueueAdded', queue)
        }

        log.debug('queue stats from api:', { queue })
        setQueueStatus(queue)

        return queue
      }
    },
    [setQueueStatus],
  )

  const handleClaim = useCallback(async () => {
    try {
      showLoading(true)

      let currentQueueStatus = queueStatus

      // if user has no queue status, we try to add him to queue
      if (!currentQueueStatus) {
        currentQueueStatus = await checkQueueStatus(true)
      }

      const { status } = currentQueueStatus || {}
      const isPending = status === 'pending'

      // this will only trigger the first time, since in subsequent loads claim button is disabled
      if (isPending) {
        showQueueDialog(ClaimQueuePopupText, setDialogBlur, {
          buttonText: t`OK, I’ll WAIT`,
          imageSource: claimQueueIllustration,
          imageProps: { width: '100%', height: '100%', viewBox: '0 0 177 119' },
        })
      }

      return !isPending
    } catch (e) {
      log.error('handleClaimQueue failed', e.message, e, { dialogShown: true })
      showSupportDialog(showErrorDialog, hideDialog, null, t`We could not get the Claim queue status. Please try again`)
      return false
    } finally {
      hideLoading()
    }
  }, [queueStatus, showLoading, hideLoading, checkQueueStatus, showErrorDialog, hideDialog, setDialogBlur])

  useEffect(() => {
    const initializeQueue = async () => {
      try {
        await checkQueueStatus()
      } catch (exception) {
        const { message } = exception

        log.error('checkQueueStatus API request failed', message, exception)
      }
    }

    if (isQueueDisabled) {
      setQueueStatus({ status: 'approved' })
      return
    }

    initializeQueue()
  }, [])

  return { queueStatus, handleClaim }
}
