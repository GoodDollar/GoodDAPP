import React, { useEffect } from 'react'
import { Image, Platform, View } from 'react-native'

import { CustomButton, Section, Wrapper } from '../../../common'
import { showSupportDialog } from '../../../common/dialogs/showSupportDialog'

import { useDialog } from '../../../../lib/undux/utils/dialog'
import useOnPress from '../../../../lib/hooks/useOnPress'
import { isMobileOnly } from '../../../../lib/utils/platform'
import logger from '../../../../lib/logger/pino-logger'

import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import illustration from '../../../../assets/FRUnrecoverableError.svg'

import { ZoomSDKStatus } from '../sdk/ZoomSDK'
import { ExceptionType } from '../utils/kindOfTheIssue'

const { InvalidDeviceLicenseKeyIdentifier, LicenseExpiredOrInvalid } = ZoomSDKStatus

const log = logger.child({ from: 'FaceVerification' })

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const UnrecoverableError = ({ styles, exception, attemptsHistory, screenProps }) => {
  const [, hideDialog, showErrorDialog] = useDialog()
  const { navigateTo, goToRoot, push } = screenProps

  const { type, code, message } = exception || {}
  const isLicenseIssue =
    ExceptionType.SDK === type && [InvalidDeviceLicenseKeyIdentifier, LicenseExpiredOrInvalid].includes(code)

  const onContactSupport = useOnPress(() => navigateTo('Support'), [navigateTo])
  const onDismiss = useOnPress(() => goToRoot(), [goToRoot])

  useEffect(() => {
    // if it's not an license issue - we don't have to show dialog
    if (!isLicenseIssue) {
      return
    }

    // if user is not in whitelist and we do not do faceverification then this is an error
    log.error('FaceVerification failed due to the license issue', message, exception, { dialogShown: true })
    showSupportDialog(showErrorDialog, hideDialog, push, 'Face Verification disabled')
  }, [])

  // if its an license issue - don't render anything, the dialog will be shown
  if (isLicenseIssue) {
    return null
  }

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none" color="red">
            {'Sorry about that…\nWe’re looking in to it,\nplease try again later'}
          </Section.Title>
          <Image source={illustration} resizeMode="contain" style={styles.errorImage} />
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onDismiss} style={styles.actionsSpace}>
            OK
          </CustomButton>
          <CustomButton mode="outlined" onPress={onContactSupport}>
            CONTACT SUPPORT
          </CustomButton>
        </View>
      </View>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    topContainer: {
      alignItems: 'center',
      justifyContent: 'space-evenly',
      display: 'flex',
      backgroundColor: theme.colors.surface,
      height: '100%',
      flex: 1,
      flexGrow: 1,
      flexShrink: 0,
      paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
      paddingLeft: getDesignRelativeWidth(theme.sizes.default),
      paddingRight: getDesignRelativeWidth(theme.sizes.default),
      paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
      borderRadius: 5,
    },
    errorImage: {
      height: getDesignRelativeHeight(230, false),
      marginTop: isMobileOnly ? getDesignRelativeHeight(32) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(40) : 0,
    },
    descriptionContainer: {
      flex: 1,
      marginBottom: 0,
      paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
      paddingLeft: getDesignRelativeWidth(theme.sizes.default),
      paddingRight: getDesignRelativeWidth(theme.sizes.default),
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
      width: '100%',
    },
    action: {
      width: '100%',
    },
    actionsSpace: {
      marginBottom: getDesignRelativeHeight(16),
    },
  }
}

export default withStyles(getStylesFromProps)(UnrecoverableError)
