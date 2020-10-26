// libraries
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import moment from 'moment'

// components
import AnimationsLogo from '../common/animations/Logo'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import WavesBackground from '../common/view/WavesBackground'

// utils
import Config from '../../config/config'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { isMobileNative } from '../../lib/utils/platform'
import AsyncStorage from '../../lib/utils/asyncStorage'

// assets
// import wavePattern from '../../assets/splashWaves.svg'

const { isPhaseZero, version } = Config

export const animationDuration = 5000

const lastSplashProp = 'GD_lastSplash'

export const shouldAnimateSplash = async () => {
  const lastSplash = (await AsyncStorage.getItem(lastSplashProp)) || 0
  const animateSplash = moment().diff(lastSplash, 'minutes') >= 60

  return animateSplash
}

export const resetLastSplash = async () => {
  await AsyncStorage.setItem(lastSplashProp, 0)
}

const Splash = ({ animation, isLoggedIn }) => {
  const [checked, setChecked] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(isLoggedIn !== true || isMobileNative)
  useEffect(() => {
    if (shouldAnimate) {
      return
    }
    shouldAnimateSplash().then(animateSplash => {
      if (animateSplash) {
        AsyncStorage.setItem(lastSplashProp, Date.now())
      }
      setShouldAnimate(animateSplash)
      setChecked(true)
    })
  }, [])

  if (shouldAnimate === false && checked === false) {
    return null
  }

  return (
    <Wrapper style={styles.wrapper}>
      <Section style={styles.container}>
        <WavesBackground>
          <Section.Stack style={styles.content} grow justifyContent="center">
            {isPhaseZero && (
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
                <Section.Text fontSize={16} color="white" letterSpacing={0.24} lineHeight={22} fontWeight="medium">
                  {'All G$ coins in the demo\nare for test purposes only.\nOnce all feedback is incorporated,\n'}
                  <Section.Text fontSize={16} color="white" letterSpacing={0.24} lineHeight={22} fontWeight="bold">
                    all demo G$ coins will be deleted.
                  </Section.Text>
                </Section.Text>
              </Section.Stack>
            )}
            <AnimationsLogo
              animation={shouldAnimate && animation}
              style={isMobileNative ? styles.mobileAnimation : styles.animation}
            />
            <Section.Text fontSize={16} color="darkBlue" fontWeight="medium">
              {isPhaseZero && 'Demo '}V{version}
            </Section.Text>
          </Section.Stack>
        </WavesBackground>
      </Section>
    </Wrapper>
  )
}

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
  content: {
    transform: [{ rotateY: '180deg' }],
    overflow: 'hidden',
  },
  title: {
    paddingHorizontal: 25,
    paddingBottom: getDesignRelativeHeight(8),
    marginBottom: getDesignRelativeHeight(10),
    borderBottomWidth: 2,
    borderStyle: 'solid',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderBottomColor: '#000',
  },
  animation: {
    marginTop: -getDesignRelativeHeight(75),
    marginBottom: -getDesignRelativeHeight(120),
    height: getDesignRelativeHeight(550),
  },
  mobileAnimation: {
    marginTop: -getDesignRelativeHeight(40),
    marginBottom: -getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(550),
  },
})

export default Splash
