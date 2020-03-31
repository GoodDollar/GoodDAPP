import React from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import AnimationsLogo from '../common/animations/Logo'
import wavePattern from '../../assets/splashWaves.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

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
          <Section.Stack>
            <Section.Text
              fontSize={26}
              fontWeight="bold"
              color="white"
              letterSpacing={0.13}
              lineHeight={32}
              style={styles.title}
            >
              GoodDollar Demo
            </Section.Text>
            <Section.Text fontSize={16} color="white" letterSpacing={0.24} lineHeight={22} fontWeight={500}>
              {'All G$ coins in the demo\nare for test purposes only.\nOnce all feedback is incorporated,\n'}
              <Section.Text fontSize={16} color="white" letterSpacing={0.24} lineHeight={22} fontWeight="bold">
                all demo G$ coins will be deleted.
              </Section.Text>
            </Section.Text>
          </Section.Stack>
          <AnimationsLogo animation={animation} style={styles.animation} />
          <Section.Text fontSize={16} color="darkBlue" fontWeight={500}>
            Demo V{Config.version}
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
    overflow: 'hidden',
  },
  title: {
    paddingHorizontal: 25,
    paddingBottom: getDesignRelativeHeight(8),
    marginHorizontal: 'auto',
    marginBottom: getDesignRelativeHeight(10),
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000',
  },
  animation: {
    marginTop: -getDesignRelativeHeight(75),
    marginBottom: -getDesignRelativeHeight(120),
    height: getDesignRelativeHeight(550),
  },
})

export default Splash
