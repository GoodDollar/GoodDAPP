import React from 'react'
import { StyleSheet, View } from 'react-native'
import GoodDollarImageSVG from '../../assets/Splash/goodDollar.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import QRCode from '../common/view/QrCode/QRCode'

const SplashDesktop = ({ onContinue, urlForQR }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <View style={styles.backgroundWaves} />
      <Section.Stack style={styles.content} grow justifyContent="space-between">
        <Section.Text fontSize={22}>
          <Section.Text fontSize={22} fontWeight="black">
            {`Welcome to GoodDollar Wallet\n`}
          </Section.Text>
          {`For best experience\nplease scan and continue\non your mobile device.`}
        </Section.Text>
        <QRCode value={urlForQR} size={150} qrStyles={styles.qrStyles} />
        <View style={styles.goodDollar}>
          <GoodDollarImageSVG />
        </View>
        <CustomButton mode="outlined" color="white" style={styles.buttonContinue} onPress={onContinue}>
          Continue on Web
        </CustomButton>
      </Section.Stack>
    </Section>
  </Wrapper>
)

SplashDesktop.navigationOptions = {
  title: 'GoodDollar | Welcome',
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 0,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    transform: [{ rotateY: '180deg' }],
    flex: 1,
  },
  backgroundWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',

    // backgroundImage: `url(${wavePattern})`,
    // backgroundRepeat: 'repeat-y',
    // backgroundSize: 'cover',
    opacity: 0.2,
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
