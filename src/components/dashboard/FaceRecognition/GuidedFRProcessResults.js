//@flow
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { CustomButton, Section } from '../../common'
import logger from '../../../lib/logger/pino-logger'
import Divider from '../../../assets/Dividers - Long Line - Stroke Width 2 - Round Cap - Light Blue.svg'
import Check from '../../../assets/Icons - Success - White.svg'
import Cross from '../../../assets/Icons - Close X - White.svg'
const log = logger.child({ from: 'GuidedFRProcessResults' })

const FRStep = ({ title, isActive, status }) => {
  let statusColor = status === true ? 'success' : 'failure'
  let statusIcon = <Image source={status ? Check : Cross} resizeMode={'center'} style={{ height: 14 }} />

  //not active use grey otherwise based on status
  let textColor = isActive === false ? '#CBCBCB' : status === false ? '#FA6C77' : '#42454A'
  log.debug('FRStep', { title, status, isActive, statusColor, textColor })
  return (
    <View style={{ flexDirection: 'row', paddingTop: 0, marginRight: 0 }}>
      <View style={{ flexGrow: 2, textAlign: 'left' }}>
        <Text style={{ color: textColor, fontSize: normalize(16), verticalAlign: 'middle', lineHeight: 28 }}>
          {title}
        </Text>
      </View>
      {isActive ? <Text>.....</Text> : null}
      {status === undefined ? null : <View style={[styles[statusColor], styles.statusIcon]}>{statusIcon}</View>}
    </View>
  )
}
const GuidedFRProcessResults = ({ profileSaved, userStorage, sessionId }: any) => {
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

  // const isProcessFailed =
  //   processStatus.isDuplicate ||
  //   !processStatus.enrollResult ||
  //   !processStatus.livenessPassed ||
  //   !processStatus.whitelisted

  logger.debug('processStatus', { processStatus })

  return (
    <View style={styles.topContainer}>
      <Section
        style={{
          paddingBottom: 0,
          paddingTop: 31,
          marginBottom: 0,
          paddingLeft: 44,
          paddingRight: 44,
          justifyContent: 'space-between',
          flex: 1
        }}
      >
        <Section.Title style={styles.mainTitle}>
          <Text>Analyzing Results...</Text>
        </Section.Title>
        <View
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            padding: 0,
            flex: 1
          }}
        >
          <Image source={Divider} style={{ height: 2 }} />
          <View style={{ marginBottom: 22, marginTop: 22 }}>
            <FRStep title={'Checking duplicates'} isActive={true} status={processStatus.isDuplicate === false} />
            <FRStep
              title={'Checking liveness'}
              isActive={processStatus.isDuplicate !== undefined && processStatus.isDuplicate === false}
              status={processStatus.livenessPassed}
            />
            <FRStep
              title={'Validating identity'}
              isActive={processStatus.livenessPassed !== undefined && processStatus.livenessPassed === true}
              status={processStatus.whitelisted}
            />
            <FRStep
              title={'Updating profile'}
              isActive={processStatus.whitelisted !== undefined && processStatus.whitelisted === true}
              status={profileSaved}
            />
          </View>
          <Image source={Divider} style={{ height: 2 }} />
        </View>
      </Section>
      <Section>
        <CustomButton onPress={_ => {}}>Face CAPTCHA Verification</CustomButton>
      </Section>
    </View>
  )
}

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-between',
    paddingTop: 33
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: 20,
    justifyContent: 'flex-end'
  },
  description: {
    fontSize: normalize(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#00AFFF',
    paddingTop: 25,
    paddingBottom: 25
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none'
  },
  statusIcon: {
    justifyContent: 'center'
  },
  success: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#00C3AE'
  },
  failure: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#FA6C77',
    flexGrow: 0
  }
})
export default GuidedFRProcessResults
