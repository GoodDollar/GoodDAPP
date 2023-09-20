import React, { useEffect } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import { CustomButton, Section, Wrapper } from '../../common'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'

import { useDialog } from '../../../lib/dialog/useDialog'
import { isMobileOnly } from '../../../lib/utils/platform'
import logger from '../../../lib/logger/js-logger'

import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import IllustrationSVG from '../../../assets/FRUnrecoverableError.svg'
import GiveUpButton from '../standalone/components/GiveUpButton'

import { ExceptionType, isLicenseIssue } from '../utils/kindOfTheIssue'

const log = logger.child({ from: 'FaceVerification' })

const UnrecoverableError = ({ styles, exception, nav }) => {
  const { hideDialog, showErrorDialog } = useDialog()
  const { goToRoot, push } = nav

  const { type, message } = exception || {}
  const isSDKLicenseIssue = ExceptionType.SDK === type && isLicenseIssue(exception)

  useEffect(() => {
    // if it's not an license issue - we don't have to show dialog
    if (!isSDKLicenseIssue) {
      return
    }

    // if user is not in whitelist and we do not do faceverification then this is an error
    log.error('FaceVerification failed due to the license issue', message, exception, { dialogShown: true })
    showSupportDialog(showErrorDialog, hideDialog, push, 'Face Verification disabled. Please try again', goToRoot)
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
            {t`Sorry about that pall…
            We’re looking in to it,
            please try again later`}
          </Section.Title>
          <View style={styles.errorImage}>
            <IllustrationSVG />
          </View>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={goToRoot} style={styles.actionsSpace}>
            OK
          </CustomButton>
          <GiveUpButton />
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
      justifyContent: 'center',
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
    actionsSpace: {
      marginBottom: getDesignRelativeHeight(16),
    },
  }
}

export default withStyles(getStylesFromProps)(UnrecoverableError)
