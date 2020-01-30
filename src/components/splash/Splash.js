import React from 'react'
import { Image, Platform, StyleSheet } from 'react-native'
import splashImage from '../../assets/Splash/logo.svg'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import AnimationsLogo from '../common/animations/Logo'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import WavesBackground from '../common/view/BackroundWaves'

if (Platform.OS === 'web') {
  // minimize delay <Image> has over web <img>
  Image.prefetch(splashImage)
  Image.prefetch(goodDollarImage)
}

const Splash = () => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <WavesBackground>
        <AnimationsLogo />
        <Section.Text style={styles.version} fontSize={22}>{`V${Config.version}`}</Section.Text>
      </WavesBackground>
    </Section>
  </Wrapper>
)

Splash.navigationOptions = {
  title: 'GoodDollar | Welcome',
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 0,
  },
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    marginVertical: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  version: {
    zIndex: 100,
  },
  logo: {
    maxWidth: '100%',
    minHeight: 135,
    minWidth: 135,
    marginBottom: getDesignRelativeHeight(64),
  },
  goodDollar: {
    maxWidth: '100%',
    minHeight: 30,
    minWidth: 212,
    marginBottom: getDesignRelativeHeight(22),
  },
})

export default Splash
