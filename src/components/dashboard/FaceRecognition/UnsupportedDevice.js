import React, { useEffect, useState } from 'react'
import { AsyncStorage, View } from 'react-native'
import { get } from 'lodash'
import QRCode from 'qrcode.react'
import { isIOS, isMobile } from '../../../lib/utils/platform'
import { GD_USER_MNEMONIC } from '../../../lib/constants/localStorage'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import Config from '../../../config/config'
import { CopyButton, Section, Wrapper } from '../../common'
import Separator from '../../common/layout/Separator'
import OopsSVG from '../../../assets/oops.svg'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
import { fireEvent } from '../../../lib/analytics/analytics'
import { withStyles } from '../../../lib/styles'
import Text from '../../common/view/Text'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'

const log = logger.child({ from: 'UnsupportedDevice' })

const UnsupportedDevice = props => {
  const store = GDStore.useStore()
  const [code, setCode] = useState(undefined)
  const { fullName } = store.get('profile')
  const styles = props.styles
  const reason = get(props, 'screenProps.screenState.reason', undefined)

  log.debug({ reason })

  let error =
    "In order to continue, it's best you switch to your mobile device, also for best experience use Chrome/Safari browser."
  let title = `${getFirstWord(fullName)},\nWe need to talk...`
  if (isIOS) {
    title = `${getFirstWord(fullName)},\niPhones are great, but...`
  }
  switch (reason) {
    default:
    case 'isNotMobileSafari':
      error =
        'In order to continue, you will need to switch to your Safari browser.\nJust copy and paste the link into Safari.'
      break
  }

  const generateQRCode = async () => {
    const mnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)
    const url = `${Config.publicUrl}/Auth/Recover/?mnemonic=${mnemonic}&redirect=${encodeURI(
      '/AppNavigation/Dashboard/FRIntro'
    )}`
    const code = encodeURI(url)
    log.debug({ code })
    setCode(code)
  }

  useEffect(() => {
    fireEvent(`FR_Unsupported_${reason}`)
    generateQRCode()
  }, [])

  const qrCode =
    isMobile === true || code === undefined ? null : (
      <React.Fragment>
        <Text style={styles.qrText}>Scan via your mobile</Text>
        <View style={styles.qrView}>
          <QRCode value={code} size={111} />
        </View>
      </React.Fragment>
    )

  const copyCode =
    isMobile === false || code === undefined ? null : (
      <View>
        <CopyButton mode="contained" toCopy={code}>
          Copy Link
        </CopyButton>
      </View>
    )
  const codeAction = isMobile ? copyCode : qrCode
  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.mainContainer} justifyContent="space-evenly">
          <Section.Title style={styles.mainTitle} fontWeight="medium" textTransform="none">
            {title}
          </Section.Title>
          <View style={styles.image}>
            <OopsSVG />
          </View>
          <Section style={styles.textContainer}>
            <Separator width={2} />
            <Text fontSize={16} fontWeight="bold" color="primary" style={styles.description}>
              {`${error}`}
            </Text>
            <Separator width={2} />
          </Section>
        </Section>
        <Section>{codeAction}</Section>
      </View>
    </Wrapper>
  )
}

UnsupportedDevice.navigationOptions = {
  navigationBarHidden: false,
  title: 'Friendly Suggestion',
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
    borderRadius: 5,
    fontFamily: theme.fonts.default,
  },
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
  textContainer: {
    padding: 0,
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
  },
  mainContainer: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
    paddingLeft: getDesignRelativeWidth(10),
    paddingRight: getDesignRelativeWidth(10),
    flex: 1,
  },
  image: {
    height: getDesignRelativeHeight(146),
  },
  qrCodeSize: {
    width: getDesignRelativeWidth(160),
    height: getDesignRelativeHeight(160),
  },
  description: {
    padding: 0,
    paddingTop: getDesignRelativeHeight(15),
    paddingBottom: getDesignRelativeHeight(15),
  },
  mainTitle: {
    color: theme.colors.darkGray,
    textTransform: 'none',
  },
})

UnsupportedDevice.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(UnsupportedDevice)
