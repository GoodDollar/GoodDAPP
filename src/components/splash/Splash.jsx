// libraries
import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import moment from 'moment'

// components
import AnimationsLogo from '../common/animations/Logo'
import Wrapper from '../common/layout/Wrapper'
import Section from '../common/layout/Section'
import WavesBackground from '../common/view/WavesBackground'
import GoodWalletSvg from '../../assets/goodWalletSplash.svg'
import { shouldShowDeprecationDialog, useDeprecationDialog } from '../browserSupport/components/DeprecationDialog'

// utils
import Config from '../../config/config'
import { getDesignRelativeHeight, getMaxDeviceHeight } from '../../lib/utils/sizes'
import { isMobile, isMobileNative } from '../../lib/utils/platform'
import AsyncStorage from '../../lib/utils/asyncStorage'

const { version } = Config

export const animationDuration = 5000

const lastSplashProp = 'GD_lastSplash'

export const shouldAnimateSplash = async isReload => {
  if (isReload) {
    return false
  }

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
  const { showDeprecationDialog } = useDeprecationDialog()

  useEffect(() => {
    ;(async () => {
      const shouldShow = await shouldShowDeprecationDialog()

      if (!shouldShow) {
        return
      }

      showDeprecationDialog()
    })()
  }, [showDeprecationDialog])

  // const onPoweredByPress = useCallback(() => openLink(Config.poweredByUrl), [])

  useEffect(() => {
    if (shouldAnimate) {
      return
    }
    shouldAnimateSplash().then(animateSplash => {
      if (animateSplash) {
        AsyncStorage.safeSet(lastSplashProp, Date.now())
      }

      setShouldAnimate(animateSplash)
      setChecked(true)
    })
  }, [])

  if (shouldAnimate === false && checked === false) {
    return null
  }

  return (
    <Wrapper style={isMobile ? styles.mobileWrapper : styles.wrapper}>
      <Section style={styles.container}>
        <WavesBackground>
          <Section.Stack style={styles.content} grow justifyContent="center">
            <AnimationsLogo
              animation={shouldAnimate && animation}
              style={isMobileNative ? styles.mobileAnimation : styles.animation}
            />
            <Section style={styles.gwLogoContainer}>
              <GoodWalletSvg />
              <Section.Text fontSize={16} color="white" fontWeight="medium">
                V{version}
              </Section.Text>
            </Section>
          </Section.Stack>
          {/* <TouchableOpacity style={styles.poweredByLogo} onPress={onPoweredByPress}>
            <PoweredByLogo />
          </TouchableOpacity> */}
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
    maxHeight: getMaxDeviceHeight(),
  },
  mobileWrapper: {
    padding: 0,
    flex: 1,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    flex: 1,
  },
  content: {
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

  // poweredByLogo: {
  //   transform: [{ rotateY: '180deg' }],
  // },
  animation: {
    marginTop: -getDesignRelativeHeight(75),
    marginBottom: -getDesignRelativeHeight(120),
    height: getDesignRelativeHeight(550),
  },
  mobileAnimation: {
    marginTop: -getDesignRelativeHeight(40),
    marginBottom: -getDesignRelativeHeight(
      Platform.select({
        android: 160,
        default: 200,
      }),
    ),
    height: getDesignRelativeHeight(550),
  },
  gwLogoContainer: {
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.select({
      web: 20,
      android: 0,
    }),
  },
})

export default Splash
