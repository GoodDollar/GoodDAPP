import React, { useCallback, useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import Text from '../../common/view/Text'
import userStorage from '../../../lib/gundb/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'
import API from '../../../lib/API/api'
import { CLAIM_QUEUE, fireEvent } from '../../../lib/analytics/analytics'
import useLoadingIndicator from '../../../lib/hooks/useLoadingIndicator'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import illustration from '../../../assets/Claim/claimQueue.svg'
import { withStyles } from '../../../lib/styles'
import Config from '../../../config/config'
import logger from '../../../lib/logger/pino-logger'

const getStyles = ({ theme }) => ({
  title: {
    borderColor: 'orange',
    borderBottomWidth: 2,
    borderTopWidth: 2,
    paddingTop: 10,
    paddingBottom: 10,
  },
})

const ClaimQueuePopup = ({ styles }) => (
  <View style={{ flex: 1 }}>
    <View style={styles.title}>
      <Text lineHeight={28} textAlign={'left'} fontWeight={'medium'} fontSize={22}>
        Good things come to those who wait...
      </Text>
    </View>
    <View style={{ paddingTop: 20, paddingBottom: 20 }}>
      <Text
        textAlign={'left'}
        lineHeight={22}
      >{`We’re still making sure our magic works as expected, which means there is a slight queue before you can start claiming G$’s.`}</Text>
      <Text lineHeight={22} style={{ paddingTop: 20 }} fontWeight={'bold'} textAlign={'left'}>
        We’ll email you as soon as it’s your turn to claim.
      </Text>
    </View>
  </View>
)
const ClaimQueuePopupThemed = withStyles(getStyles)(ClaimQueuePopup)

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
        showDialog({
          type: 'queue',
          isMinHeight: true,
          image: (
            <Image
              source={illustration}
              style={{ marginRight: 'auto', marginLeft: 'auto', width: '33vh', height: '28vh' }}
              resizeMode="contain"
            />
          ),
          buttons: [
            {
              text: 'OK, Got it',
            },
          ],
          message: <ClaimQueuePopupThemed />,
        })
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
