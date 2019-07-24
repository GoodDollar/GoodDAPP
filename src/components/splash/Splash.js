import React from 'react'
import { Image, StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import splashImage from '../../assets/Splash/logo.svg'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import wavePattern from '../../assets/wave.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'

//minimize delay <Image> has over web <img>
Image.prefetch(splashImage)
Image.prefetch(goodDollarImage)
Image.prefetch(wavePattern)

const Splash = () => (
  <Wrapper style={styles.container}>
    <Wrapper style={styles.wrapper}>
      <Section style={styles.content} grow justifyContent="space-between">
        <Section.Text fontSize={22} fontFamily="regular" color="darkBlue">
          {`Welcome and thank you\nfor participating in GoodDollar's\n`}
          <Section.Text fontSize={22} fontFamily="bold" color="darkBlue">
            Early Access Alpha
          </Section.Text>
        </Section.Text>
        <Image source={splashImage} style={styles.logo} resizeMode="contain" />
        <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
        <Section.Text fontSize={22} fontFamily="regular" color="darkBlue">
          V2.0
        </Section.Text>
      </Section>
    </Wrapper>
  </Wrapper>
)

Splash.navigationOptions = {
  title: 'GoodDollar | Welcome',
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `url(${wavePattern})`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: 'cover',
    transform: 'rotateY(180deg)',
  },
  content: {
    transform: 'rotateY(180deg)',
    backgroundColor: 'transparent',
    marginVertical: '10vh',
  },
  logo: {
    maxWidth: '100%',
    minHeight: normalize(135),
    minWidth: normalize(135),
  },
  goodDollar: {
    maxWidth: '100%',
    minHeight: normalize(30),
    minWidth: normalize(212),
  },
})

export default Splash
