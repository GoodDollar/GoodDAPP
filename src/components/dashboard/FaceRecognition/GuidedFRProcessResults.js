//@flow
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { CustomButton, Section } from '../../common'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'GuidedFRProcessResults' })

const GuidedFRProcessResults = props => {
  const [progressTextS, setText] = useState('')
  const [processStatus, setStatus] = useState({
    isDuplicate: undefined,
    enrollResult: undefined,
    livenessPassed: undefined,
    whitelisted: undefined
  })

  const updateProgress = data => {
    logger.debug('updating progress')
    logger.debug({ data })

    let explanation = ''
    setStatus({ ...data })

    logger.debug('analyzed data,', { processStatus })

    if (data && data.isDuplicate) {
      explanation = 'Your are already in the database'
      setText(explanation)

      return
    }

    log.debug('before enroll result', { explanation })
    if (data && !data.livenessPassed) {
      explanation = 'Please improve your conditions'
      setText(explanation)
      return
    }

    log.debug('before liveness result', { explanation })

    log.info({ explanation })
    setText(explanation)
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

  const isProcessFailed =
    processStatus.isDuplicate ||
    !processStatus.enrollResult ||
    !processStatus.livenessPassed ||
    !processStatus.whitelisted

  logger.debug('processStatus', { processStatus })

  return (
    <View>
      <View style={styles.topContainer}>
        <Section.Title style={styles.mainTitle}>{`Analyzing Results...`}</Section.Title>
        {processStatus.isDuplicate != undefined && (
          <Section.Text
            style={processStatus.isDuplicate ? styles.textFailure : styles.textSuccess}
          >{`Checking for duplicates...`}</Section.Text>
        )}
        {processStatus.isDuplicate != undefined && (
          <Section.Text style={styles.waitingAnimation}>{`....`}</Section.Text>
        )}
        <Section.Text style={processStatus.isDuplicate ? styles.logoFail : styles.logoSuccess}>{`logo`}</Section.Text>

        {processStatus.enrollResult != undefined && (
          <Section.Text
            style={processStatus.enrollResult.alreadyEnrolled ? styles.textFailure : styles.textSuccess}
          >{`Enrolling...`}</Section.Text>
        )}
        {processStatus.enrollResult != undefined && (
          <Section.Text style={styles.waitingAnimation}>{`....`}</Section.Text>
        )}

        <Section.Text
          style={
            processStatus.enrollResult && processStatus.enrollResult.alreadyEnrolled
              ? styles.logoFailure
              : styles.logoSuccess
          }
        >{`logo`}</Section.Text>

        {processStatus.livenessPassed != undefined && (
          <Section.Text
            style={processStatus.livenessPassed ? styles.textSuccess : styles.textFailure}
          >{`Checking liveness...`}</Section.Text>
        )}
        {processStatus.livenessPassed != undefined && (
          <Section.Text style={styles.waitingAnimation}>{`....`}</Section.Text>
        )}

        <Section.Text
          style={processStatus.livenessPassed ? styles.logoSuccess : styles.logoFailure}
        >{`logo`}</Section.Text>

        {processStatus.whitelisted != undefined && (
          <Section.Text
            style={processStatus.whitelisted ? styles.textSuccess : styles.textFailure}
          >{`Registering account...`}</Section.Text>
        )}
        {processStatus.whitelisted != undefined && (
          <Section.Text style={styles.waitingAnimation}>{`....`}</Section.Text>
        )}

        <Section.Text
          style={processStatus.whitelisted ? styles.logoSuccess : styles.logoFailure}
        >{`logo`}</Section.Text>
      </View>

      {isProcessFailed && (
        <CustomButton mode="contained" loading={true} onPress={() => {}}>
          {`Please Try Again`}
        </CustomButton>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  description: {
    fontSize: normalize(20)
  },
  mainTitle: {
    color: '#42454A'
  },
  textSuccess: {
    color: '#42454A'
  },
  textFailure: {
    color: '#CBCBCB'
  },
  logoFailure: {
    color: 'red'
  },
  logoSuccess: {
    color: 'green'
  }
})
export default GuidedFRProcessResults
