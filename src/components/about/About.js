import React from 'react'
import { Image, StyleSheet } from 'react-native'
import splashImage from '../../assets/Splash/logoPrimary.svg'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import wavePattern from '../../assets/wave.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'

//minimize delay <Image> has over web <img>
Image.prefetch(splashImage)
Image.prefetch(goodDollarImage)
Image.prefetch(wavePattern)

const About = () => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <Section.Stack style={styles.content} grow justifyContent="space-between">
        <Section.Text fontSize={18} color="surface">
          Welcome to
        </Section.Text>
        <Image source={splashImage} style={styles.logo} resizeMode="contain" />
        <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
        <Section.Text fontSize={22} color="surface">
          {`V${Config.version}`}
        </Section.Text>
        <Section.Text fontSize={18} color="surface">
          GoodDollar is a payment system with a built-in UBI based on blockchain technology.
          <Section.Text fontSize={18} fontWeight="700" color="surface">
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
    backgroundImage: `url(${wavePattern})`,
    backgroundRepeat: 'repeat-y',
    backgroundColor: 'transparent',
    backgroundSize: 'cover',
    transform: [{ rotateY: '180deg' }],
    flex: 1,
  },
  content: {
    transform: [{ rotateY: '180deg' }],
    marginVertical: '10vh',
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
})

export default About
