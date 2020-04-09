//@flow
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { findKey } from 'lodash'
import Text from '../../common/view/Text'

// import { find, mapValues } from 'lodash'

import { getFirstWord } from '../../../lib/utils/getFirstWord'
import CustomButton from '../../common/buttons/CustomButton'
import Section from '../../common/layout/Section'
import Separator from '../../common/layout/Separator'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'
import LookingGoodSVG from '../../../assets/LookingGood.svg'
import GDStore from '../../../lib/undux/GDStore'
import { fireEvent } from '../../../lib/analytics/analytics'
import { withStyles } from '../../../lib/styles'
import normalize from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import FRStep from './FRStep'

const log = logger.child({ from: 'GuidedFRProcessResults' })

const GuidedFRProcessResults = ({ profileSaved, sessionId, retry, done, navigation, isAPISuccess, styles }: any) => {
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
      log.error('FR Error', 'An error occurred during gun sessionId updates', null, {
        sessionId,
        failedFR,
        error: data.isError,
      })
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

  const saveProfile = async () => {
    try {
      log.debug('savingProfileAndDone')
      let account = await goodWallet.getAccountForType('zoomId')
      await userStorage.setProfileField('zoomEnrollmentId', account, 'private')
      setStatus({ ...processStatus, isProfileSaved: true })
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
      saveProfile()
    }
  }, [processStatus.isWhitelisted])

  useEffect(() => {
    //done save profile and call done callback
    if (processStatus.isProfileSaved) {
      setTimeout(done, 2000)
    }
  }, [processStatus.isProfileSaved])

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

  let lookingGoodComponent =
    isProcessFailed === false && processStatus.isProfileSaved ? (
      <View style={styles.imageView}>
        <Text style={styles.textGood}>{`Looking Good ${getFirstWord(fullName)}`}</Text>
        <View style={styles.image}>
          <LookingGoodSVG />
        </View>
      </View>
    ) : null

  let helpText

  //if (processStatus.useAPIResult && isAPISuccess === false) {
  if (processStatus.isError) {
    helpText = `Something went wrong, please try again...\n\n(${processStatus.isError})`
  } else if (processStatus.isNotDuplicate === false) {
    helpText = (
      <View>
        <Text color="red">{'You look very familiar...\nIt seems you already have a wallet,\nyou can:\n\n'}</Text>
        <Text color="red">
          A.{' '}
          <Text color="red" fontWeight="bold" textDecorationLine="underline" onPress={gotoRecover}>
            Recover previous wallet
          </Text>
          {'\n'}
        </Text>
        <Text color="red">
          B.{' '}
          <Text color="red" fontWeight="bold" textDecorationLine="underline" onPress={gotoSupport}>
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
    log.error('FR failed', 'Some of the verification steps failed', null, { processStatus })
    helpText = 'Something went wrong, please try again...'
  }
  return (
    <View style={styles.topContainer}>
      <Section style={styles.mainContainer} justifyContent="space-around">
        <Section.Title style={styles.mainTitle} justifyContent="center" alignItems="center">
          Analyzing Results...
        </Section.Title>
        <View style={styles.mainView}>
          <Separator width={2} />
          <View style={styles.steps}>
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
        <View style={styles.imageView}>
          <Text color="red">{helpText}</Text>
        </View>
        <View style={styles.imageContainer}>{lookingGoodComponent}</View>
      </Section>
      {retryButtonOrNull}
    </View>
  )
}
const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    fontFamily: theme.fonts.default,
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: theme.sizes.defaultQuadruple,
    borderRadius: 5,
  },
  imageView: {
    flexShrink: 0,
  },
  imageContainer: {
    height: getDesignRelativeHeight(192),
  },
  image: {
    marginTop: getDesignRelativeHeight(36),
    height: getDesignRelativeHeight(135),
  },
  mainContainer: {
    paddingBottom: 0,
    paddingTop: theme.sizes.defaultQuadruple,
    marginBottom: 0,
    paddingLeft: getDesignRelativeWidth(44),
    paddingRight: getDesignRelativeWidth(44),
    flex: 1,
  },
  mainView: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
    padding: 0,
    flexGrow: 0,
  },
  mainTitle: {
    fontSize: normalize(24),
    color: theme.colors.darkGray,
    display: 'flex',
  },
  button: {
    fontSize: normalize(16),
  },
  steps: {
    marginBottom: getDesignRelativeHeight(22),
    marginTop: getDesignRelativeHeight(22),
  },
  textGood: {
    fontSize: normalize(24),
    textTransform: 'none',
    textAlign: 'center',
  },
})

export default withStyles(getStylesFromProps)(GuidedFRProcessResults)
