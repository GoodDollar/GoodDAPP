import React, { useEffect } from 'react'
import { AsyncStorage, View } from 'react-native'
import moment from 'moment'
import { isMobileSafari } from '../../../lib/utils/platform'
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
import AddAppSVG from '../../../assets/addApp.svg'
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
    <View style={props.styles.image}>
      <AddAppSVG />
    </View>
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
  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()
  const { show, showAddWebAppDialog } = store.get('addWebApp')
  const installPrompt = store.get('installPrompt')

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

  const handleLater = async () => {
    const skipCount = await AsyncStorage.getItem('GD_AddWebAppSkipCount')
    const newSkipCount = Number(skipCount) || 0
    const nextCheckInDays = Math.pow(2, newSkipCount)
    const nextCheckDate = moment()
      .add(nextCheckInDays, 'days')
      .toDate()

    await Promise.all([
      AsyncStorage.setItem('GD_AddWebAppSkipCount', newSkipCount + 1),
      AsyncStorage.setItem('GD_AddWebAppLastCheck', new Date().toISOString()),
      AsyncStorage.setItem('GD_AddWebAppNextCheck', nextCheckDate.toISOString()),
    ])
  }

  const installApp = async () => {
    installPrompt.prompt()
    let outcome = await installPrompt.userChoice
    if (outcome.outcome === 'accepted') {
      fireEvent(ADDTOHOME_OK)
      log.debug('App Installed')
    } else {
      fireEvent(ADDTOHOME_REJECTED)
      log.debug('App not installed')
    }

    // Remove the event reference
    store.set('installPrompt')(null)
  }

  const handleInstallApp = () => {
    if (installPrompt) {
      installApp()
    } else if (isMobileSafari) {
      AsyncStorage.setItem('GD_AddWebAppIOSAdded', true)
      showExplanationDialog()
    }
  }

  const showInitialDialog = async isReminder => {
    const skipCount = await AsyncStorage.getItem('GD_AddWebAppSkipCount')

    showDialog({
      content: <InitialDialog showDesc={!isReminder} />,
      onDismiss: () => {
        fireEvent(ADDTOHOME_LATER, { skipCount })
        handleLater()
      },
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

  const checkShowDialog = async () => {
    const [lastCheck, nextCheck, skipCount, lastClaim, iOSAdded] = await Promise.all([
      AsyncStorage.getItem('GD_AddWebAppLastCheck'),
      AsyncStorage.getItem('GD_AddWebAppNextCheck'),
      AsyncStorage.getItem('GD_AddWebAppSkipCount').then(sc => Number(sc) || 0),
      AsyncStorage.getItem('GD_AddWebAppLastClaim'),
      AsyncStorage.getItem('GD_AddWebAppIOSAdded'),
    ])
    log.debug({ installPrompt, show, skipCount })
    if (lastCheck === undefined) {
      return
    }

    // Condition to show reminder
    if (lastCheck) {
      const isNextCheckBanned = !!nextCheck && moment(nextCheck).isAfter(moment())
      const notClaimedAfterLastCheck = lastClaim ? moment(lastCheck).isAfter(moment(lastClaim)) : true

      if (isNextCheckBanned || notClaimedAfterLastCheck) {
        return
      }
    }

    if ((installPrompt && show) || (!iOSAdded && isMobileSafari && show)) {
      showInitialDialog()
    }
  }
  useEffect(() => {
    checkShowDialog()
  }, [installPrompt, show])

  useEffect(() => {
    if (showAddWebAppDialog) {
      showInitialDialog()
    }
    store.set('addWebApp')({ showAddWebAppDialog: false })
  }, [showAddWebAppDialog])

  return null
}

export default withStyles()(AddWebApp)
