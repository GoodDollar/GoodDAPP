import React from 'react'
import { Image, StyleSheet } from 'react-native'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import wavePattern from '../../assets/wave50.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'
import QRCode from '../common/view/QRCode'

//minimize delay <Image> has over web <img>
Image.prefetch(goodDollarImage)
Image.prefetch(wavePattern)

const SplashDesktop = ({ onContinue }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <Section.Stack style={styles.content} grow justifyContent="space-between">
        <Section.Text fontSize={22} color="darkBlue">
          {`For Best Experience\nplease scan and continue\non your mobile device.`}
        </Section.Text>
        <QRCode value={Config.publicUrl} size={150} qrStyles={styles.qrStyles} />
        <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
        <Section.Text fontSize={22} color="darkBlue">
          {`V${Config.version}`}
        </Section.Text>
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
    backgroundImage: `url(${wavePattern})`,
    backgroundRepeat: 'repeat-y',
    backgroundColor: 'transparent',
    backgroundSize: 'cover',
    transform: [{ rotateY: '180deg' }],
    flex: 1,
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
