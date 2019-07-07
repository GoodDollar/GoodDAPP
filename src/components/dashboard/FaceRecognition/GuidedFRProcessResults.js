//@flow
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import logger from '../../../lib/logger/pino-logger'

//import { useDialog } from '../../../lib/undux/utils/dialog'

const log = logger.child({ from: 'GuidedFRProcessResults' })

const GuidedFRProcessResults = props => {
  const [progressTextS, setText] = useState('starting...')

  const updateProgress = data => {
    log.debug('updating progress')
    log.debug({ data })

    let progressText = ''
    progressText += '1. Looking for duplicates photos...'

    if (data && data.isDuplicate) {
      progressText += ' X'
      setText(progressText)
      return
    }
    progressText += ' Success '

    progressText += '2. Checking enrollment result...'

    log.debug('before enroll result', { progressText })
    if (data && !data.enrollResult) {
      progressText += ' X'
      setText(progressText)
      return
    }
    progressText += ' Success '

    progressText += 'Checking liveness...'

    log.debug('before liveness result', { progressText })
    if (data && !data.livenessPassed) {
      progressText += ' X'
      setText(progressText)
      return
    }
    progressText += ' Success '
    log.info({ progressText })
    setText(progressText)

    /*showDialogWithData({
      title: 'Progress',
      message: progressText
    })*/
  }

  // let [showDialogWithData] = useDialog()
  let sessionId = props.sessionId
  let userStorage = props.userStorage
  let gun = userStorage.gun
  log.debug({ sessionId })

  useEffect(() => {
    gun.get(sessionId).on(updateProgress, false)
    log.debug({ progressTextS })
    return () => {
      log.debug('Removing FR guided progress listener for sessionId ', sessionId)

      gun.get(sessionId).off()
      gun.get(sessionId).set(null)
    }
  }, [])

  return (
    <View>
      <Text>{progressTextS}</Text>
    </View>
  )
}

export default GuidedFRProcessResults
