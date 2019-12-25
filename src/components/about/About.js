import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import splashImage from '../../assets/Splash/logo.svg'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import wavePattern from '../../assets/wave50.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'
import normalize from '../../lib/utils/normalizeText'

//minimize delay <Image> has over web <img>
// Image.prefetch(splashImage)
// Image.prefetch(goodDollarImage)
// Image.prefetch(wavePattern)

const About = () => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <View style={styles.backgroundWaves} />
      <Section.Stack style={styles.content} grow justifyContent="space-between">
        <Section.Text fontSize={22} color="darkBlue">
          Welcome to
        </Section.Text>
        <Image source={splashImage} style={styles.logo} resizeMode="contain" />
        <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
        <Section.Text fontSize={22} color="darkBlue">
          {`V${Config.version}`}
        </Section.Text>
        <Section.Text fontSize={18} color="surface" style={styles.aboutDescription}>
          GoodDollar is a payment system with a built-in small basic income based on blockchain technology.
          <Section.Text fontSize={18} fontWeight="bold" color="surface">
            {`\nLet's change the world, for good.`}
          </Section.Text>
        </Section.Text>
      </Section.Stack>
    </Section>
  </Wrapper>
)

About.navigationOptions = {
  title: 'About',
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 0,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transform: [{ rotateY: '180deg' }],
    position: 'relative',
    flex: 1,
  },
  backgroundWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: `url(${wavePattern})`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: 'cover',
    opacity: 0.2,
  },
  content: {
    transform: [{ rotateY: '180deg' }],
    marginTop: '5vh',
    marginBottom: '8vh',
  },
  logo: {
    maxWidth: '100%',
    minHeight: 135,
    minWidth: 135,
  },
  goodDollar: {
    maxWidth: '100%',
    minHeight: 30,
    minWidth: 212,
  },
  aboutDescription: {
    maxWidth: normalize(270),
  },
})

export default About
