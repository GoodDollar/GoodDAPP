import React, { useCallback, useState } from 'react'
import { View } from 'react-native'

// import logger from '../../lib/logger/pino-logger'
import { fireEvent } from '../../lib/analytics/analytics'
import { isBrowser } from '../../lib/utils/platform'
import { withStyles } from '../../lib/styles'
import { getShadowStyles } from '../../lib/utils/getStyles'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import Illustration from '../../assets/Auth/torusIllustration.svg'
import Section from '../common/layout/Section'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import NavBar from '../appNavigation/NavBar'
import { theme } from '../theme/styles'

// const log = logger.child({ from: 'Welcome' })

const steps = {
  1: {
    title: 'GoodDollar Wallet',
    subtitle: 'You are a few steps away from\nreceiving FREE basic income',
    illustration: Illustration,
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
    illustration: Illustration,
  },
  3: {
    title: "What's next",
    subtitle: 'Sign up and do a video selfie\nto ensure you are a real live person\nand not a bot : )',
    illustration: Illustration,
  },
}

const InviteWelcome = ({ styles, screenProps, navigation }) => {
  const [step, setStep] = useState(1)
  const { navigate } = navigation

  const goToSignUp = useCallback(() => {
    fireEvent('INVITEWELCOME_SKIPPED', { step })

    return navigate('welcome')
  }, [navigate, step])

  const nextScreen = useCallback(() => {
    fireEvent('INVITEWELCOME_NEXT', { step })
    if (step === 3) {
      return navigate('Auth', { screen: 'signup' })
    }
    setStep(step + 1)
  }, [navigate, step])

  const SVG = steps[step].illustration
  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar title="Welcome" />
      <Section.Stack style={styles.topTextContainer}>
        {step === 1 && (
          <Text
            color={'darkBlue'}
            fontSize={16}
            lineHeight={30}
            letterSpacing={0.16}
            fontFamily="Roboto"
            fontWeight="medium"
          >
            Welcome to the
          </Text>
        )}
        <Text
          color={'darkBlue'}
          fontSize={26}
          lineHeight={30}
          letterSpacing={0.26}
          fontFamily="Roboto"
          fontWeight="bold"
        >
          {steps[step].title}
        </Text>
        <Text
          color={'darkGray'}
          fontSize={15}
          lineHeight={22}
          letterSpacing={0.15}
          fontFamily="Roboto"
          fontWeight="medium"
          style={styles.subtitle}
        >
          {steps[step].subtitle}
        </Text>
      </Section.Stack>

      <View style={styles.illustration}>
        <SVG
          width={getDesignRelativeWidth(isBrowser ? 331 : 276, false)}
          height={getDesignRelativeHeight(217, false)}
          viewBox="0 0 248.327 194.594"
        />
      </View>
      <Section.Row style={styles.dots}>
        <Text style={step === 1 ? styles.activeDot : styles.dot} />
        <Text style={step === 2 ? styles.activeDot : styles.dot} />
        <Text style={step === 3 ? styles.activeDot : styles.dot} />
      </Section.Row>
      <Section.Stack style={styles.bottomContainer}>
        <>
          <Section.Stack alignItems="center" justifyContent="center">
            <CustomButton
              color={'darkBlue'}
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
                {"Let's go"}
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
                onPress={goToSignUp}
                color="darkGray"
              >
                {'Skip and create wallet'}
              </CustomButton>
            )}
          </Section.Stack>
        </>
      </Section.Stack>
    </Wrapper>
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
      marginTop: theme.sizes.default,
    },
    topTextContainer: {
      marginTop: 45,
      minHeight: 112,
    },
    dots: {
      width: 48,
      justifyContent: 'space-between',
      alignSelf: 'center',
      marginVertical: 24,
    },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.darkBlue },
    dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.darkBlue },
    bottomContainer: {
      justifyContent: 'flex-start',
      alignSelf: 'center',
      width: 220,
    },
    buttonLayout: {
      marginBottom: getDesignRelativeHeight(theme.sizes.default * 5),
      ...getShadowStyles('none', { elevation: 0 }),
      width: 220,
    },
    buttonText: {
      fontSize: 16,
    },
    illustration: {
      width: getDesignRelativeHeight(190, false),
      height: getDesignRelativeHeight(190, false),
      alignSelf: 'center',
    },
  }
}

const Welcome = withStyles(getStylesFromProps)(InviteWelcome)

Welcome.navigationOptions = {
  title: 'Welcome to GoodDollar!',
  navigationBarHidden: true,
}

export default Welcome
