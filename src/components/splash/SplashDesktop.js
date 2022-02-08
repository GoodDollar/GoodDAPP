import React, { useCallback } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Trans } from '@lingui/macro'
import GoodDollarImageSVG from '../../assets/Splash/goodDollar.svg'

import wavePattern from '../../assets/splashWaves.svg'
import { getDesignRelativeHeight, getMaxDeviceHeight } from '../../lib/utils/sizes'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import QRCode from '../common/view/QrCode/QRCode'

const SplashDesktop = ({ onContinue, urlForQR }) => {
  const _onContinue = useCallback(onContinue)
  return (
    <Wrapper style={styles.wrapper}>
      <Section style={styles.container}>
        <View style={styles.waves} />
        <Section.Stack style={styles.content} grow justifyContent="space-between">
          <Section.Text fontSize={22} color="darkBlue">
            <Section.Text fontSize={22} color="darkBlue">
              <Trans>{'Welcome to GoodDollar Wallet\n'}</Trans>
            </Section.Text>
            <Trans>{'For best experience\nplease scan and continue\non your mobile device.'}</Trans>
          </Section.Text>
          <QRCode value={urlForQR} size={150} qrStyles={styles.qrStyles} />
          <View style={styles.goodDollar}>
            <GoodDollarImageSVG />
          </View>
          <CustomButton mode="outlined" color="white" style={styles.buttonContinue} onPress={_onContinue}>
            <Trans>Continue on Web</Trans>
          </CustomButton>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

SplashDesktop.navigationOptions = {
  title: 'GoodDollar | Welcome',
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 0,
    maxHeight: getMaxDeviceHeight(),
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    transform: [{ rotateY: '180deg' }],
    flex: 1,
  },
  waves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...Platform.select({
      web: {
        backgroundImage: `url(${wavePattern})`,
        backgroundRepeat: 'repeat-y',
      },
      default: {},
    }),
    opacity: 0.1,
  },
  content: {
    transform: [{ rotateY: '180deg' }],
    marginTop: getDesignRelativeHeight(30),
    width: '100%',
  },
  goodDollar: {
    width: '100%',
    minHeight: 30,
    alignItems: 'center',
  },
  buttonContinue: {
    borderColor: 'white',
  },
  qrStyles: {
    backgroundColor: 'white',
    transform: [{ rotateY: '180deg' }],
    borderWidth: 2,
  },
})

export default SplashDesktop
