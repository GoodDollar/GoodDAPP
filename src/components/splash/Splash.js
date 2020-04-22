import React from 'react'
import { StyleSheet, View } from 'react-native'
import SplashSVG from '../../assets/Splash/logo.svg'
import GoodDollarSVG from '../../assets/Splash/goodDollar.svg'
import AnimationsLogo from '../common/animations/Logo'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import Config from '../../config/config'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import WavesBackground from '../common/view/WavesBackground'

const Splash = ({ animation }) => (
  <Wrapper style={styles.wrapper}>
    <Section style={styles.container}>
      <WavesBackground>
        {animation ? (
          <>
            <AnimationsLogo />
            <Section.Text style={styles.version} fontSize={22}>{`V${Config.version}`}</Section.Text>
          </>
        ) : (
          <Section.Stack style={styles.content} grow justifyContent="center">
            <View style={styles.logo}>
              <SplashSVG widht="100%" height="100%" />
            </View>
            <View style={styles.goodDollar}>
              <GoodDollarSVG widht="100%" height="100%" />
            </View>
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
    width: '100%',
    height: 230,
    minWidth: 230,
    marginBottom: getDesignRelativeHeight(64),
  },
  goodDollar: {
    width: '100%',
    height: 40,
    minWidth: 310,
    marginBottom: getDesignRelativeHeight(22),
    display: 'flex',
    alignItems: 'center',
  },
})

export default Splash
