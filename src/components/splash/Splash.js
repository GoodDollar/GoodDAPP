import React from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import AnimationsLogo from '../common/animations/Logo'
import wavePattern from '../../assets/splashWaves.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'

const Splash = ({ animation }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <ImageBackground
        source={wavePattern}
        imageStyle={styles.waves}
        style={styles.backgroundWaves}
        resizeMode="repeat"
      >
        <Section.Stack style={styles.content} grow justifyContent="center">
          <AnimationsLogo animation={animation} />
          <Section.Text fontSize={22} color="darkBlue">
            V{Config.version}
          </Section.Text>
        </Section.Stack>
      </ImageBackground>
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
  },
  waves: {
    opacity: 0.1,
  },
  content: {
    transform: [{ rotateY: '180deg' }],
  },
})

export default Splash
