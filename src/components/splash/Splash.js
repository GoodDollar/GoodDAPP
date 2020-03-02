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

const Splash = ({ animation }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <WavesBackground>
        {animation ? (
          <>
            <AnimationsLogo />
          </>
        ) : (
          <Section.Stack style={styles.content} grow justifyContent="center">
            <Image source={splashImage} style={styles.logo} resizeMode="contain" />
            <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
            <Section.Text fontSize={22}>{`V${Config.version}`}</Section.Text>
          </Section.Stack>
        )}
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
    minHeight: 230,
    minWidth: 230,
    marginBottom: getDesignRelativeHeight(64),
  },
  goodDollar: {
    maxWidth: '100%',
    minHeight: 40,
    minWidth: 310,
    marginBottom: getDesignRelativeHeight(22),
  },
})

export default Splash
