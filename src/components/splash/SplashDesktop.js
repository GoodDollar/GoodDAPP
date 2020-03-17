import React from 'react'
import { Image, ImageBackground, StyleSheet } from 'react-native'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import wavePattern from '../../assets/splashWaves.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import QRCode from '../common/view/QRCode'

//minimize delay <Image> has over web <img>
Image.prefetch(goodDollarImage)
Image.prefetch(wavePattern)

const SplashDesktop = ({ onContinue, urlForQR }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <ImageBackground
        source={wavePattern}
        imageStyle={styles.wavesImage}
        style={styles.backgroundWaves}
        resizeMode="repeat"
      >
        <Section.Stack style={styles.content} grow justifyContent="space-between">
          <Section.Text fontSize={22} color="darkBlue">
            <Section.Text fontSize={22} fontWeight="black" color="darkBlue">
              {`Welcome to GoodDollar Wallet\n`}
            </Section.Text>
            {`For best experience\nplease scan and continue\non your mobile device.`}
          </Section.Text>
          <QRCode value={urlForQR} size={150} qrStyles={styles.qrStyles} />
          <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
          <CustomButton mode="outlined" color="white" style={styles.buttonContinue} onPress={onContinue}>
            Continue on Web
          </CustomButton>
        </Section.Stack>
      </ImageBackground>
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
    padding: 10,
  },
  wavesImage: {
    opacity: 0.2,
  },
  content: {
    transform: [{ rotateY: '180deg' }],
    marginTop: getDesignRelativeHeight(30),
    width: '100%',
  },
  goodDollar: {
    maxWidth: '100%',
    minHeight: 30,
    minWidth: 212,
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
