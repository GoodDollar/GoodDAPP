import React, { useEffect } from 'react'
import { get } from 'lodash'

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

import { fireEvent, FV_TRYAGAINLATER } from '../../../../lib/analytics/analytics'

import { ZoomSDKStatus } from '../sdk/ZoomSDK'

const { InvalidDeviceLicenseKeyIdentifier, LicenseExpiredOrInvalid } = ZoomSDKStatus

const log = logger.child({ from: 'FaceVerification' })

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const UnrecoverableError = ({ styles, exception, screenProps }) => {
  const [, hideDialog, showErrorDialog] = useDialog()

  const sdkStatus = get(exception, 'code')
  const isLicenseIssue = [InvalidDeviceLicenseKeyIdentifier, LicenseExpiredOrInvalid].includes(sdkStatus)

  const onContactSupport = useOnPress(() => screenProps.navigateTo('Support'), [screenProps])
  const onDismiss = useOnPress(() => screenProps.goToRoot(), [screenProps])

  useEffect(() => {
    if (!isLicenseIssue) {
      fireEvent(FV_TRYAGAINLATER)
      return
    }

    // if user is not in whitelist and we do not do faceverification then this is an error
    log.error('FaceVerification failed', '', exception, { dialogShown: true })
    showSupportDialog(showErrorDialog, hideDialog, screenProps.push, 'Face Verification disabled')
  }, [])

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
