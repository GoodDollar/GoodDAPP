import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

// import logger from '../../lib/logger/pino-logger'
import { fireEvent, INVITEWELCOME_NEXT, INVITEWELCOME_SKIPPED } from '../../lib/analytics/analytics'
import { withStyles } from '../../lib/styles'
import { getShadowStyles } from '../../lib/utils/getStyles'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { IS_FIRST_VISIT } from '../../lib/constants/localStorage'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import WalletSVG from '../../assets/Invite/wallet.svg'
import SelfieSVG from '../../assets/Invite/selfie.svg'
import MobileSVG from '../../assets/Invite/mobile.svg'

import Section from '../common/layout/Section'
import { getDesignRelativeHeight, isShortDevice, isVeryShortDevice } from '../../lib/utils/sizes'
import NavBar from '../appNavigation/NavBar'
import { theme } from '../theme/styles'

// const log = logger.child({ from: 'Welcome' })

const steps = {
  1: {
    title: 'GoodDollar Wallet',
    subtitle: 'You are a few steps away from\nreceiving FREE basic income',
    illustration: WalletSVG,
  },
  2: {
    title: 'How To Use',
    subtitle: (
      <>
        {'Collect free income every day\nby pressing the '}
        <Text color={theme.colors.green} fontSize={15} fontWeight={'bold'}>
          CLAIM
        </Text>
        {' button in\nyour GoodDollar wallet'}
      </>
    ),
    illustration: MobileSVG,
  },
  3: {
    title: "What's next?",
    subtitle: 'Sign up and do a video selfie\nto ensure you are a real live person\nand not a bot : )',
    illustration: SelfieSVG,
  },
}

const InviteWelcome = ({ styles, screenProps, navigation }) => {
  const [step, setStep] = useState(1)
  const [show, setShow] = useState(undefined)

  const { navigate } = navigation

  const skipIntro = useCallback(() => {
    fireEvent(INVITEWELCOME_SKIPPED, { step })
    return done()
  }, [navigate])
  const goToSignUp = useCallback(() => {
    fireEvent(INVITEWELCOME_SKIPPED, { step })

    return navigate('Welcome')
  }, [navigate, step])

  const done = () => {
    AsyncStorage.setItem(IS_FIRST_VISIT, false)

    return navigate('Auth', { screen: 'signup' })
  }

  const nextScreen = useCallback(() => {
    fireEvent(INVITEWELCOME_NEXT, { step })
    if (step === 3) {
      return done()
    }
    setStep(step + 1)
  }, [navigate, step])

  useEffect(() => {
    AsyncStorage.getItem(IS_FIRST_VISIT).then(isNew => {
      if (isNew == null) {
        setShow(true)
      } else {
        goToSignUp()
      }
    })

    // 454
    // alert(Dimensions.get('window').height)
  }, [])
  const SVG = steps[step].illustration
  return (
    show === true && (
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <NavBar title="Welcome" />
        <Section.Stack style={styles.contentContainer}>
          <Section.Stack>
            {step === 1 && (
              <Text
                color={'darkBlue'}
                fontSize={getDesignRelativeHeight(16)}
                lineHeight={getDesignRelativeHeight(30)}
                letterSpacing={0.16}
                fontFamily="Roboto"
                fontWeight="medium"
              >
                Welcome to the
              </Text>
            )}
            <Text
              color={'darkBlue'}
              fontSize={getDesignRelativeHeight(26)}
              lineHeight={getDesignRelativeHeight(30)}
              letterSpacing={0.26}
              fontFamily="Roboto"
              fontWeight="bold"
            >
              {steps[step].title}
            </Text>
            <Text
              color={'darkGray'}
              fontSize={getDesignRelativeHeight(15)}
              lineHeight={getDesignRelativeHeight(22)}
              letterSpacing={0.15}
              fontFamily="Roboto"
              fontWeight="medium"
              style={styles.subtitle}
            >
              {steps[step].subtitle}
            </Text>
          </Section.Stack>

          <View style={styles.illustration}>
            <SVG />
          </View>

          <Section.Stack style={styles.bottomContainer}>
            <>
              <Section.Row style={styles.dots}>
                <Text style={step === 1 ? styles.activeDot : styles.dot} />
                <Text style={step === 2 ? styles.activeDot : styles.dot} />
                <Text style={step === 3 ? styles.activeDot : styles.dot} />
              </Section.Row>
              <Section.Stack alignItems="center" justifyContent="center">
                <CustomButton
                  color={'primary'}
                  style={styles.buttonLayout}
                  textStyle={styles.buttonText}
                  onPress={nextScreen}
                >
                  {step === 3 ? 'Create Wallet' : 'Next'}
                </CustomButton>
              </Section.Stack>
              <Section.Stack>
                {step === 3 ? (
                  <Text letterSpacing={0.14} fontSize={14} fontWeight={'bold'} lineHeight={19} color={'darkGray'}>
                    {"Let's go!"}
                  </Text>
                ) : (
                  <CustomButton
                    textStyle={{
                      letterSpacing: 0.14,
                      textDecorationLine: 'underline',
                      lineHeight: 19,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                    mode="text"
                    onPress={skipIntro}
                    color="darkGray"
                  >
                    {'Skip and create wallet'}
                  </CustomButton>
                )}
              </Section.Stack>
            </>
          </Section.Stack>
        </Section.Stack>
      </Wrapper>
    )
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'flex-start',
    },
    subtitle: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
    },
    contentContainer: {
      flex: 1,
      paddingBottom: isVeryShortDevice ? 20 : 0,
      paddingTop: getDesignRelativeHeight(isShortDevice ? 35 : 45),
      justifyContent: 'space-evenly',
    },
    dots: {
      width: 48,
      justifyContent: 'space-between',
      alignSelf: 'center',
      marginBottom: getDesignRelativeHeight(20),
    },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.darkBlue },
    dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.darkBlue },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
    },
    buttonLayout: {
      marginBottom: theme.sizes.default * (isShortDevice ? 1 : 5),
      ...getShadowStyles('none', { elevation: 0 }),
      minHeight: 40,
      height: isShortDevice ? 40 : 44,
      width: '100%',
      maxWidth: 384,
    },
    buttonText: {
      fontSize: 16,
    },
    illustration: {
      width: 216,
      height: 216,
      alignSelf: 'center',
      justifyContent: 'center',
      transform: [
        {
          // Can't change width nor height because the SVG gets cut
          scale: getDesignRelativeHeight(1.0),
        },
      ],
    },
  }
}

const Welcome = withStyles(getStylesFromProps)(InviteWelcome)

Welcome.navigationOptions = {
  title: 'Welcome to GoodDollar!',
  navigationBarHidden: true,
}

export default Welcome
