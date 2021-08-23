import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { Platform, View } from 'react-native'

import Text from '../../common/view/Text'
import Icon from '../view/Icon'

import Config from '../../../config/config'
import logger from '../../../lib/logger/pino-logger'

import AsyncStorage from '../../../lib/utils/asyncStorage'
import { useDialog } from '../../../lib/undux/utils/dialog'
import SimpleStore, { assertStore } from '../../../lib/undux/SimpleStore'
import { isMobileSafari, isMobileWeb } from '../../../lib/utils/platform'

import {
  ADDTOHOME,
  ADDTOHOME_LATER,
  ADDTOHOME_OK,
  ADDTOHOME_REJECTED,
  fireEvent,
} from '../../../lib/analytics/analytics'

import { withStyles } from '../../../lib/styles'
import AddAppSVG from '../../../assets/addApp.svg'

// import userStorage from '../../../lib/userStorage/UserStorage'
// import API from '../../../lib/API/api'

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
      borderTopColor: theme.colors.primary,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      paddingVertical: theme.sizes.default,
      marginVertical: theme.sizes.default,
      ...Platform.select({
        web: {
          borderBottomStyle: 'solid',
          borderTopStyle: 'solid',
        },
      }),
    },
    explanationDialogContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    explanationDialogText: {
      width: '100%',
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500',
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
  const [show, setShow] = useState(false)
  const [showAddWebAppDialog, setShowAddWebAppDialog] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(false)

  const fetchStoreData = useCallback(() => {
    if (assertStore(store, log, 'Failed to fetch show status to display AddWebApp modal')) {
      const { show: _show, showAddWebAppDialog: _showAddWebAppDialog } = store.get('addWebApp')
      const _installPrompt = store.get('installPrompt')

      setShow(_show)
      setShowAddWebAppDialog(_showAddWebAppDialog)
      setInstallPrompt(_installPrompt)
    }
  }, [store, setShow, setShowAddWebAppDialog, setInstallPrompt])

  const showExplanationDialog = () => {
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

  const handleUserPromptChoice = async () => {
    try {
      let outcome = await installPrompt.userChoice
      if (outcome.outcome === 'accepted') {
        fireEvent(ADDTOHOME_OK)
        log.debug('App Installed')
      } else {
        fireEvent(ADDTOHOME_REJECTED)
        log.debug('App not installed')
      }
    } catch (e) {
      log.error('prompt user choice failed', e.message, e)
    }

    // Remove the event reference
    store.set('installPrompt')(null)
  }

  const handleInstallApp = () => {
    if (installPrompt) {
      //calling prompt from a non async context, async may happen to cause browser to say its not from user gesture
      installPrompt
        .prompt()
        .then(_ => handleUserPromptChoice())
        .catch(e => {
          log.error('prompt display failed', e.message, e)
        })
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
    //dont show add to home on pure desktop
    if (isMobileWeb === false && Config.showAddToHomeDesktop === false) {
      return
    }
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
    fetchStoreData()
  }, [store])

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

export default AddWebApp
