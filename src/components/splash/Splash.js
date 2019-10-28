import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import splashImage from '../../assets/Splash/logo.svg'
import goodDollarImage from '../../assets/Splash/goodDollar.svg'
import wavePattern from '../../assets/wave50.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'

//minimize delay <Image> has over web <img>
Image.prefetch(splashImage)
Image.prefetch(goodDollarImage)
Image.prefetch(wavePattern)

const getTopText = () => {
  let text = (
    <Section.Text fontSize={22} color="darkBlue">
      {`Welcome and thank you\nfor participating in GoodDollar's\n`}
      <Section.Text fontSize={22} fontWeight="black" color="darkBlue">
        Early Access Alpha V2.0
      </Section.Text>
    </Section.Text>
  )

  if (Config.isEToro) {
    text = (
      <Section.Text fontSize={22} color="darkBlue">
        <Section.Text fontSize={22} fontWeight="black" color="darkBlue">
          {`Welcome to GoodDollar Wallet\n`}
        </Section.Text>
        {`Visit GoodMarket and spend\nyour GoodDollars before they expire\non Feb 11th`}
      </Section.Text>
    )
  }

  return text
}

const Splash = () => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <View style={styles.backgroundWaves} />
      <Section.Stack style={styles.content} grow justifyContent="space-between">
        {getTopText()}
        <Image source={splashImage} style={styles.logo} resizeMode="contain" />
        <Image source={goodDollarImage} style={styles.goodDollar} resizeMode="contain" />
        <Section.Text fontSize={22} color="darkBlue">
          {`V${Config.version}`}
        </Section.Text>
      </Section.Stack>
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
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotateY: '180deg' }],
    position: 'relative',
    backgroundColor: 'transparent',
    flex: 1,
  },
  backgroundWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: `url(${wavePattern})`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: 'cover',
    opacity: 0.4,
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

export default Splash
