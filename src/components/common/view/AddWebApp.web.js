import React, { useEffect, useState } from 'react'
import { AsyncStorage, Image, View } from 'react-native'
import { isMobileSafari } from 'mobile-device-detect'
import moment from 'moment'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { useDialog } from '../../../lib/undux/utils/dialog'
import {
  ADDTOHOME,
  ADDTOHOME_LATER,
  ADDTOHOME_OK,
  ADDTOHOME_REJECTED,
  fireEvent,
} from '../../../lib/analytics/analytics'
import { withStyles } from '../../../lib/styles'
import addAppIlustration from '../../../assets/addApp.svg'
import Icon from '../view/Icon'
import userStorage from '../../../lib/gundb/UserStorage'
import API from '../../../lib/API/api'

import Text from '../../common/view/Text'

import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'AddWebApp' })

const mapStylesToProps = ({ theme }) => {
  return {
    image: {
      width: '100%',
      height: '15vh',
    },
    imageContainer: {
      padding: 32,
    },
    titleContainer: {
      borderTopWidth: 2,
      borderTopStyle: 'solid',
      borderTopColor: theme.colors.primary,
      borderBottomWidth: 2,
      borderBottomStyle: 'solid',
      borderBottomColor: theme.colors.primary,
      paddingVertical: theme.sizes.default,
      marginVertical: theme.sizes.default,
    },
    explanationDialogContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    explanationDialogText: {
      width: '100%',
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: 500,
    },
    explanationDialogTextBold: {
      fontWeight: 'bold',
    },
  }
}

const DiaglogTitle = withStyles(mapStylesToProps)(({ children, styles }) => (
  <View style={styles.titleContainer}>
    <Text textAlign="left" fontSize={22} fontWeight="medium">
      {children}
    </Text>
  </View>
))

const DialogImage = props => (
  <View style={props.styles.imageContainer}>
    <Image style={props.styles.image} source={addAppIlustration} resizeMode="contain" {...props} />
  </View>
)

const InitialDialog = withStyles(mapStylesToProps)(({ showDesc, styles }) => {
  return (
    <View style={styles.container}>
      <DialogImage styles={styles} />
      <DiaglogTitle>Add icon to home screen for easy access</DiaglogTitle>
      {showDesc && (
        <Text textAlign="left" color="gray80Percent" fontSize={14}>
          You can collect your daily GoodDollars with ease by adding this shortcut to your home screen.
        </Text>
      )}
    </View>
  )
})

const ExplanationDialog = withStyles(mapStylesToProps)(({ styles }) => {
  return (
    <View style={styles.explanationDialogContainer}>
      <Text fontSize={14} style={styles.explanationDialogText}>
        {'Add this web-app to your iPhone:'}
      </Text>
      <Text fontSize={14} style={styles.explanationDialogText}>
        {'tap'} <Icon name="ios-share" size={20} /> {'then '}
        <Text fontSize={14} style={[styles.explanationDialogText, styles.explanationDialogTextBold]}>
          {'“Add to home screen"'}
        </Text>
      </Text>
    </View>
  )
})

const AddWebApp = props => {
  const [installPrompt, setInstallPrompt] = useState()
  const [lastCheck, setLastCheck] = useState()
  const [nextCheck, setNextCheck] = useState()
  const [skipCount, setSkipCount] = useState(0)
  const [lastClaim, setLastClaim] = useState()
  const [dialogShown, setDialogShown] = useState()
  const [iOSAdded, setIOSAdded] = useState(false)

  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()
  const { show } = store.get('addWebApp')

  useEffect(() => {
    AsyncStorage.getItem('GD_AddWebAppLastCheck').then(setLastCheck)
    AsyncStorage.getItem('GD_AddWebAppNextCheck').then(setNextCheck)
    AsyncStorage.getItem('GD_AddWebAppSkipCount').then(sc => setSkipCount(Number(sc)))
    AsyncStorage.getItem('GD_AddWebAppLastClaim').then(setLastClaim)
    AsyncStorage.getItem('GD_AddWebAppIOSAdded').then(setIOSAdded)

    log.debug('useEffect, registering beforeinstallprompt')

    const installPrompt = store.get('installPrompt')
    if (installPrompt) {
      setInstallPrompt(installPrompt)
    }
  }, [])

  const showExplanationDialog = async () => {
    const magicLinkCode = userStorage.getMagicLink()
    const mobile = await userStorage.getProfileFieldValue('mobile')

    API.sendMagicCodeBySms(mobile, magicLinkCode).catch(e => {
      log.error('Failed to send magic link code to user by sms', e.message, e)
    })

    showDialog({
      content: <ExplanationDialog />,
      showButtons: false,
      showAtBottom: true,
      showTooltipArrow: true,
      isMinHeight: false,
      onDismiss: () => handleLater,
    })
  }

  const handleLater = () => {
    const newSkipCount = Number(skipCount) + 1
    const nextCheckInDays = Math.pow(2, skipCount)
    const nextCheckDate = moment()
      .add(nextCheckInDays, 'days')
      .toDate()

    AsyncStorage.setItem('GD_AddWebAppSkipCount', newSkipCount)
    AsyncStorage.setItem('GD_AddWebAppLastCheck', new Date().toISOString())
    AsyncStorage.setItem('GD_AddWebAppNextCheck', nextCheckDate.toISOString())
  }

  const installApp = async () => {
    installPrompt.prompt()
    let outcome = await installPrompt.userChoice
    if (outcome.outcome == 'accepted') {
      fireEvent(ADDTOHOME_OK)
      log.debug('App Installed')
    } else {
      fireEvent(ADDTOHOME_REJECTED)
      log.debug('App not installed')
    }

    // Remove the event reference
    setInstallPrompt(null)
  }

  const handleInstallApp = () => {
    if (installPrompt) {
      installApp()
    } else if (isMobileSafari) {
      AsyncStorage.setItem('GD_AddWebAppIOSAdded', true)
      showExplanationDialog()
    }
  }

  const showInitialDialog = isReminder => {
    showDialog({
      content: <InitialDialog showDesc={!isReminder} />,
      buttons: [
        {
          text: 'Later',
          mode: 'text',
          color: props.theme.colors.gray80Percent,
          onPress: dismiss => {
            fireEvent(ADDTOHOME_LATER, { skipCount })
            dismiss()
            handleLater()
          },
        },
        {
          text: 'Add Icon',
          onPress: dismiss => {
            fireEvent(ADDTOHOME, { skipCount })
            dismiss()
            handleInstallApp()
          },
        },
      ],
    })
  }

  useEffect(() => {
    if (dialogShown) {
      showInitialDialog()
    }
  }, [dialogShown])

  useEffect(() => {
    log.debug({ installPrompt, show, skipCount })

    // Condition to show reminder
    if (lastCheck) {
      const isNextCheckBanned = !!nextCheck && moment(nextCheck).isAfter(moment())
      const notClaimedAfterLastCheck = lastClaim ? moment(lastCheck).isAfter(moment(lastClaim)) : true

      if (isNextCheckBanned || notClaimedAfterLastCheck) {
        return
      }
    }

    if ((installPrompt && show) || (!iOSAdded && isMobileSafari && show)) {
      setDialogShown(true)
    }
  }, [installPrompt, show, lastCheck])

  return null
}

export default withStyles()(AddWebApp)
