import React from 'react'
import { Image, StyleSheet } from 'react-native'
import splashImage from '../../assets/Splash/logo.svg'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'
import normalize from '../../lib/utils/normalizeText'
import WavesBackground from '../common/view/BackroundWaves'

//minimize delay <Image> has over web <img>
// Image.prefetch(splashImage)
// Image.prefetch(goodDollarImage)
// Image.prefetch(wavePattern)

const About = () => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <WavesBackground>
        <Section.Stack style={styles.content} grow justifyContent="space-between">
          <Section.Text fontSize={22} color="darkBlue">
            Welcome to
          </Section.Text>
          <Section.Row style={styles.imageContainer}>
            <Image source={splashImage} style={styles.logo} resizeMode="contain" />
            <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
            <Section.Text fontSize={22} color="darkBlue">
              {`V${Config.version}`}
            </Section.Text>
          </Section.Row>
          <Section.Text fontSize={18} color="surface" style={styles.aboutDescription}>
            GoodDollar is a payment system with a built-in small basic income based on blockchain technology.
            <Section.Text fontSize={18} fontWeight="bold" color="surface">
              {`\nLet's change the world, for good.`}
            </Section.Text>
          </Section.Text>
        </Section.Stack>
      </WavesBackground>
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
    position: 'relative',
    flex: 1,
  },
  content: {
    marginTop: '5%',
    marginBottom: '8%',
  },
  logo: {
    maxWidth: '100%',
    minHeight: 135,
    minWidth: 135,
    flex: 1,
  },
  goodDollar: {
    maxWidth: '100%',
    minHeight: 30,
    minWidth: 212,
  },
  aboutDescription: {
    maxWidth: normalize(270),
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    maxHeight: '50%',
  },
})

export default About
