import React, { useEffect, useState } from 'react'
import { AsyncStorage, View } from 'react-native'

import QRCode from 'qrcode.react'

import Config from '../../../../config/config'

import { CopyButton } from '../../../common'
import Text from '../../../common/view/Text'

import ErrorBase from '../components/ErrorBaseWithImage'

import logger from '../../../../lib/logger/pino-logger'
import { fireEvent } from '../../../../lib/analytics/analytics'
import { isIOS, isMobile } from '../../../../lib/utils/platform'
import { GD_USER_MNEMONIC } from '../../../../lib/constants/localStorage'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

import { withStyles } from '../../../../lib/styles'

const log = logger.child({ from: 'FaceVerificationUnsupported' })

const UnsupportedScreen = ({ styles, screenProps }) => {
  const [code, setCode] = useState(undefined)
  const { reason } = screenProps.screenState

  useEffect(() => {
    const generateQRCode = async () => {
      const mnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)
      const redirect = encodeURIComponent('/AppNavigation/Dashboard/IntroScreen')
      const url = `${Config.publicUrl}/Auth/Recover/?mnemonic=${mnemonic}&redirect=${redirect}`
      const code = encodeURI(url)

      log.debug({ code })
      setCode(code)
    }

    fireEvent(`FR_Unsupported_${reason}`)
    generateQRCode()
  }, [])

  return (
    <ErrorBase
      log={log}
      reason={reason}
      action={
        code &&
        (isMobile ? (
          <View>
            <CopyButton mode="contained" toCopy={code}>
              Copy Link
            </CopyButton>
          </View>
        ) : (
          <>
            <Text style={styles.qrText}>Scan via your mobile</Text>
            <View style={styles.qrView}>
              <QRCode value={code} size={111} />
            </View>
          </>
        ))
      }
      title={isIOS ? 'iPhones are great, but...' : 'We need to talk...'}
      description={
        reason === 'isNotMobileSafari'
          ? 'In order to continue, you will need to switch to your Safari browser.\nJust copy and paste the link into Safari.'
          : "In order to continue, it's best you switch to your mobile device, also for best experience use Chrome/Safari browser."
      }
    />
  )
}

UnsupportedScreen.navigationOptions = {
  navigationBarHidden: false,
  title: 'Friendly Suggestion',
}

const getStylesFromProps = ({ theme }) => ({
  qrText: {
    alignSelf: 'center',
  },
  qrView: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 5,
    borderWidth: 1,
    padding: theme.sizes.defaultHalf,
    marginTop: getDesignRelativeHeight(theme.sizes.default),
  },
  qrCodeSize: {
    width: getDesignRelativeWidth(160),
    height: getDesignRelativeHeight(160),
  },
})

UnsupportedScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(UnsupportedScreen)
