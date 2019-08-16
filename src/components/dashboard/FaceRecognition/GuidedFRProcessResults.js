//@flow
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import findKey from 'lodash/findKey'

// import find from 'lodash/find'
// import mapValues from 'lodash/mapValues'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import CustomButton from '../../common/buttons/CustomButton'
import Section from '../../common/layout/Section'
import Icon from '../../common/view/Icon'
import Separator from '../../common/layout/Separator'
import normalize from '../../../lib/utils/normalizeText'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'
import LookingGood from '../../../assets/LookingGood.svg'
import GDStore from '../../../lib/undux/GDStore'
import { fireEvent } from '../../../lib/analytics/analytics'

const log = logger.child({ from: 'GuidedFRProcessResults' })

const FRStep = ({ title, isActive, status, isProcessFailed, paddingBottom }) => {
  paddingBottom = paddingBottom === undefined ? 12 : paddingBottom
  let statusColor = status === true ? 'success' : status === false ? 'failure' : 'none'
  let statusIcon =
    status === undefined ? null : (
      <Icon name={status ? 'success' : 'close'} size={14} color="#fff" style={{ textAlign: 'center' }} />
    )
  let spinner =
    isProcessFailed !== true && status === undefined && isActive === true ? <ActivityIndicator color={'gray'} /> : null
  let iconOrSpinner =
    statusIcon || spinner ? <View style={[styles[statusColor], styles.statusIcon]}>{statusIcon || spinner}</View> : null

  //not active use grey otherwise based on status
  let textStyle = isActive === false ? styles.textInactive : status === false ? styles.textError : styles.textActive
  log.debug('FRStep', { title, status, isActive, statusColor, textStyle })
  return (
    <View style={{ flexDirection: 'row', paddingTop: 0, marginRight: 0, paddingBottom }}>
      <View style={{ flexGrow: 2 }}>
        <Text style={textStyle}>{title}</Text>
      </View>
      {iconOrSpinner}
    </View>
  )
}
const GuidedFRProcessResults = ({ profileSaved, sessionId, retry, done, navigation, isAPISuccess }: any) => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')

  const [processStatus, setStatus] = useState({
    isError: undefined,
    isStarted: undefined,
    isNotDuplicate: undefined,
    isEnrolled: undefined,
    isLive: undefined,
    isWhitelisted: undefined,
    isProfileSaved: undefined,
  })

  const updateProgress = data => {
    log.debug('updating progress', { data })

    // let explanation = ''
    let failedFR = findKey(data, (v, k) => v === false)
    if (data.isError) {
      fireEvent(`FR_Error`, { failedFR, error: data.isError })
      log.error('FR Error', data.isError)
    } else if (failedFR) {
      fireEvent(`FR_Failed`, { failedFR })
    }
    setStatus({ ...processStatus, ...data })

    // log.debug('analyzed data,', { processStatus })

    // if (data && data.isNotDuplicate) {
    //   explanation = 'Your are already in the database'
    //   setText(explanation)

    //   return
    // }

    // log.debug('before enroll result', { explanation })
    // if (data && !data.isLive) {
    //   explanation = 'Please improve your conditions'
    //   setText(explanation)
    //   return
    // }

    // log.debug('before liveness result', { explanation })

    // log.info({ explanation })
    // setText(explanation)
  }

  // let [showDialogWithData] = useDialog()
  let gun = userStorage.gun
  log.debug({ sessionId, isAPISuccess })

  useEffect(() => {
    log.debug('subscriping to gun updates:', { sessionId })
    gun.get(sessionId).on(updateProgress, false)
    return () => {
      log.debug('Removing FR guided progress listener for sessionId ', sessionId)

      gun.get(sessionId).off()
      gun.get(sessionId).set(null)
    }
  }, [])

  const saveProfileAndDone = async () => {
    try {
      log.debug('savingProfileAndDone')
      let account = await goodWallet.getAccountForType('zoomId')
      await userStorage.setProfileField('zoomEnrollmentId', account, 'private')
      setStatus({ ...processStatus, isProfileSaved: true })

      setTimeout(done, 2000)
    } catch (e) {
      setStatus({ ...processStatus, isProfileSaved: false })
    }
  }

  const gotoRecover = () => {
    navigation.push('Recover')
  }
  const gotoSupport = () => {
    navigation.push('Support')
  }

  useEffect(() => {
    //done save profile and call done callback
    if (processStatus.isWhitelisted) {
      saveProfileAndDone()
    }
  }, [processStatus.isWhitelisted])

  // useEffect(() => {
  //   if (isAPISuccess === undefined) {
  //     return
  //   }

  //   //API call finished, so it will pass isWhitelisted to us
  //   //this is a backup incase the gundb messaging doesnt work
  //   const gunOK = find(processStatus, (v, k) => v !== undefined)
  //   if (gunOK === undefined) {
  //     const newStatus = mapValues(processStatus, v => false)
  //     setStatus({ ...newStatus, isWhitelisted: isAPISuccess, useAPIResult: true })
  //   }
  // }, [isAPISuccess])

  const isProcessFailed =
    processStatus.isNotDuplicate === false ||
    processStatus.isEnrolled === false ||
    processStatus.isLive === false ||
    processStatus.isWhitelisted === false ||
    processStatus.isProfileSaved === false

  const isProcessSuccess = processStatus.isWhitelisted === true
  log.debug('processStatus', { processStatus, isProcessSuccess, isProcessFailed })

  let retryButtonOrNull = isProcessFailed ? (
    <Section>
      <CustomButton style={styles.button} onPress={retry}>
        Please Try Again
      </CustomButton>
    </Section>
  ) : null

  let lookingGood =
    isProcessFailed === false && processStatus.isProfileSaved ? (
      <View style={{ flexShrink: 0 }}>
        <Text style={styles.textGood}>{`Looking Good ${getFirstWord(fullName)}`}</Text>
        <Image source={LookingGood} resizeMode={'center'} style={{ marginTop: 36, height: 135 }} />
      </View>
    ) : null

  let helpText

  //if (processStatus.useAPIResult && isAPISuccess === false) {
  if (processStatus.isError) {
    helpText = `Something went wrong, please try again...\n\n(${processStatus.isError})`
  } else if (processStatus.isNotDuplicate === false) {
    helpText = (
      <View>
        <Text style={styles.textHelp}>
          {'You look very familiar...\nIt seems you already have a wallet,\nyou can:\n\n'}
        </Text>
        <Text style={styles.textHelp}>
          A.{' '}
          <Text style={[styles.helpLink, styles.textHelp]} onPress={gotoRecover}>
            Recover previous wallet
          </Text>
          {'\n'}
        </Text>
        <Text style={styles.textHelp}>
          B.{' '}
          <Text style={[styles.helpLink, styles.textHelp]} onPress={gotoSupport}>
            Contact support
          </Text>
          {'\n'}
        </Text>
      </View>
    )
  } else if (processStatus.isLive === false) {
    helpText =
      'We could not verify you are a living person. Funny hu? please make sure:\n\n' +
      'A. Center your webcam\n' +
      'B. Camera is at eye level\n' +
      'C. Light your face evenly'
  } else if (isProcessFailed) {
    log.error('FR failed', processStatus)
    helpText = 'Something went wrong, please try again...'
  }
  return (
    <View style={styles.topContainer}>
      <Section
        style={{
          paddingBottom: 0,
          paddingTop: 31,
          marginBottom: 0,
          paddingLeft: 44,
          paddingRight: 44,
          justifyContent: 'space-around',
          flex: 1,
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
            flexGrow: 0,
          }}
        >
          <Separator width={2} />
          <View style={{ marginBottom: 22, marginTop: 22 }}>
            <FRStep
              title={'Checking duplicates'}
              isActive={true}
              status={isProcessSuccess || processStatus.isNotDuplicate}
              isProcessFailed={isProcessFailed}
            />
            <FRStep
              title={'Checking liveness'}
              isActive={
                isProcessFailed ||
                isProcessSuccess ||
                (processStatus.isNotDuplicate !== undefined && processStatus.isNotDuplicate === true)
              }
              status={isProcessSuccess || processStatus.isLive}
              isProcessFailed={isProcessFailed}
            />
            <FRStep
              title={'Validating identity'}
              isActive={
                isProcessFailed ||
                isProcessSuccess ||
                (processStatus.isLive !== undefined && processStatus.isLive === true)
              }
              status={isProcessSuccess || processStatus.isWhitelisted}
              isProcessFailed={isProcessFailed}
            />
            <FRStep
              title={'Updating profile'}
              isActive={
                isProcessFailed ||
                isProcessSuccess ||
                (processStatus.isWhitelisted !== undefined && processStatus.isWhitelisted === true)
              }
              status={isProcessSuccess || processStatus.isProfileSaved}
              isProcessFailed={isProcessFailed}
              paddingBottom={0}
            />
          </View>
          <Separator width={2} />
        </View>
        <View style={{ flexShrink: 0 }}>
          <Text style={styles.textHelp}>{helpText}</Text>
        </View>
        {lookingGood}
      </Section>
      {retryButtonOrNull}
    </View>
  )
}

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: 33,
    borderRadius: 5,
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(16),
  },
  statusIcon: {
    justifyContent: 'center',
  },
  textActive: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(16),
    color: '#42454A',
    textTransform: 'none',
    lineHeight: 28,
  },
  textInactive: {
    fontFamily: 'Roboto',
    fontSize: normalize(16),
    color: '#CBCBCB',
    textTransform: 'none',
    lineHeight: 28,
  },
  textError: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(16),
    color: '#FA6C77',
    textTransform: 'none',
    lineHeight: 28,
  },
  textHelp: {
    fontFamily: 'Roboto',
    fontSize: normalize(16),
    color: '#FA6C77',
    textTransform: 'none',
  },
  helpLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  textGood: {
    fontFamily: 'Roboto-medium',
    fontSize: normalize(24),
    textTransform: 'none',
    textAlign: 'center',
  },
  success: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#00C3AE',
  },
  failure: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#FA6C77',
    flexGrow: 0,
  },
})

export default GuidedFRProcessResults
