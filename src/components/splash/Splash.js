import React from 'react'
import { StyleSheet, View } from 'react-native'
import AnimationsLogo from '../common/animations/Logo'
import wavePattern from '../../assets/wave50.svg'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'

const Splash = ({ animation }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <View style={styles.backgroundWaves} />
      <Section.Stack style={styles.content} grow justifyContent="center">
        <AnimationsLogo animation={animation} />
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
    opacity: 0.2,
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
})

export default Splash
