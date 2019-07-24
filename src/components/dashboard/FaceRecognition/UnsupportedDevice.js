import React, { useEffect, useState } from 'react'
import { AsyncStorage, Image, StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { isIOS, isMobile } from 'mobile-device-detect'

import get from 'lodash/get'
import QRCode from 'qrcode.react'
import Config from '../../../config/config'
import { CopyButton, Section, Wrapper } from '../../common'
import Separator from '../../common/layout/Separator'
import Oops from '../../../assets/oops.svg'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
import { fireEvent } from '../../../lib/analytics/analytics'

const log = logger.child({ from: 'UnsupportedDevice' })

const UnsupportedDevice = props => {
  const store = GDStore.useStore()
  const [code, setCode] = useState(undefined)
  const { fullName } = store.get('profile')

  const reason = get(props, 'screenProps.screenState.reason', undefined)

  log.debug({ reason })

  let error =
    "In order to continue, it's best you switch to your mobile device, also for best experience use Chrome/Safari browser."
  let title = `${fullName},\nWe need to talk...`
  if (isIOS) {
    title = `${fullName},\niPhones are great, but...`
  }
  switch (reason) {
    default:
    case 'isNotMobileSafari':
      error =
        'In order to continue, you will need to switch to your Safari browser.\nJust copy and paste the link into Safari.'
      break
  }

  const generateQRCode = async () => {
    const mnemonic = await AsyncStorage.getItem('GD_USER_MNEMONIC')
    const url = `${Config.publicUrl}/Auth/Recover/?mnemonic=${mnemonic}`
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
        <Text style={{ alignSelf: 'center', fontFamily: 'Roboto' }}>Scan via your mobile</Text>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            borderColor: '#00AFFF',
            borderRadius: normalize(5),
            borderWidth: 1,
            padding: normalize(4),
            marginTop: normalize(8),
          }}
        >
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
        <Section
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            paddingLeft: '10%',
            paddingRight: '10%',
            justifyContent: 'space-evenly',
            flex: 1,
          }}
        >
          <Section.Title style={styles.mainTitle}> {title}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={{ height: normalize(146) }} />
          <Section
            style={{
              padding: 0,
              paddingBottom: 0,
              paddingTop: 0,
              marginBottom: 0,
            }}
          >
            <Separator width={2} />
            <Section.Text style={styles.description}>
              <Text style={{ fontWeight: 'normal' }}> {`${error}`} </Text>
            </Section.Text>
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

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    paddingTop: normalize(33),
    borderRadius: 5,
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end',
  },
  description: {
    fontSize: normalize(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#00AFFF',
    padding: 0,
    paddingTop: normalize(15),
    paddingBottom: normalize(15),
    verticalAlign: 'text-top',
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none',
  },
})

UnsupportedDevice.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}
export default UnsupportedDevice
