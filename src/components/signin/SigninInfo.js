// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import { t } from '@lingui/macro'

import Section from '../common/layout/Section'
import Circle from '../common/view/Circle'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { CustomButton } from '../common'
import { withStyles } from '../../lib/styles'
import SingInSVG from '../../assets/Signin/illustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import useOnPress from '../../lib/hooks/useOnPress'
import { isMobileNative } from '../../lib/utils/platform'

const Signin = props => {
  const { styles, navigation } = props

  const handleRecover = useOnPress(() => navigation.navigate('Recover'), [navigation])

  const goToSupport = useOnPress(() => navigation.navigate('Support'), [navigation])

  return (
    <Section.Stack grow justifyContent="flex-start">
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <View style={styles.illustration}>
          <SingInSVG />
        </View>
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <View style={styles.bottomContainer}>
            <Section.Stack>
              <Circle number={1}>
                {t`Go to your `}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  {t`email`}
                </Text>
              </Circle>
              <Circle number={2}>
                Find{' '}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  GoodDollar Magic Link
                </Text>
              </Circle>
              <Circle
                number={3}
                subText={
                  <Text
                    fontFamily="Roboto"
                    fontSize={14}
                    letterSpacing={0.14}
                    color="gray80Percent"
                    lineHeight={16}
                    style={styles.thirdCircleSubText}
                  >
                    {t`
                    * works from any device`}
                  </Text>
                }
              >
                {t`Click the `}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  Magic Link Button
                </Text>
              </Circle>
            </Section.Stack>
          </View>
        </Section.Row>
      </Wrapper>
      <Section.Row alignItems="center" justifyContent="center">
        <CustomButton
          textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}
          mode="text"
          onPress={handleRecover}
          testID="recoverPhrase"
        >
          {t`Or, recover from pass phrase`}
        </CustomButton>
      </Section.Row>
      <Section.Row alignItems="center" justifyContent="center">
        <CustomButton
          textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}
          mode="text"
          onPress={goToSupport}
          style={styles.haveIssuesText}
        >
          {t`Still having issues? contact support`}
        </CustomButton>
      </Section.Row>
    </Section.Stack>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingTop: 35,
      justifyContent: Platform.select({
        web: 'space-evenly',
        default: 'space-around',
      }),
      flexDirection: 'column',
      marginBottom: 15,
      ...Platform.select({
        web: {
          maxHeight: '75%',
        },
      }),
    },
    row: {
      flex: 1,
      flexDirection: 'row',
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginTop: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(30),
      maxWidth: '100%',
      maxHeight: getDesignRelativeHeight(142, false),
      minHeight: getDesignRelativeHeight(95, false),
      width: '100%',
      justifyContent: 'center',
    },
    text: {
      color: theme.colors.green,
    },
    recoverText: {
      marginBottom: 15,
    },
    haveIssuesText: {
      marginBottom: 30,
    },
    contentContainer: {
      flexGrow: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    scrollableContainer: {
      flexGrow: 1,
    },
    thirdCircleSubText: {
      position: 'absolute',
      bottom: -13,
    },
  }
}

const signin = withStyles(getStylesFromProps)(Signin)
signin.navigationOptions = {
  title: 'Sign in',
  navigationBarHidden: false,
}

export default createStackNavigator(
  {
    signin,
  },
  {
    backRouteName: isMobileNative ? 'Welcome' : 'Auth',
  },
)
