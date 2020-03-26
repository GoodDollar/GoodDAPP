// @flow
import React from 'react'
import { AsyncStorage, Platform, TouchableOpacity, View } from 'react-native'
import Section from '../common/layout/Section'
import Circle from '../common/view/Circle'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'

import { withStyles } from '../../lib/styles'
import SingInSVG from '../../assets/Signin/illustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { createStackNavigator } from '../appNavigation/stackNavigation'

const Signin = props => {
  const { styles } = props

  AsyncStorage.removeItem('GD_web3Token')

  const handleRecover = () => {
    props.navigation.navigate('Recover')
  }

  const goToSupport = () => {
    props.navigation.navigate('Support')
  }

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
                {'Go to your '}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  email
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
                    {'\n* works from any device'}
                  </Text>
                }
              >
                {'Click the '}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  Magic Link Button
                </Text>
              </Circle>
            </Section.Stack>
          </View>
        </Section.Row>
      </Wrapper>
      <Section.Row alignItems="center" justifyContent="center">
        <TouchableOpacity onPress={handleRecover}>
          <Section.Text
            fontWeight="medium"
            style={styles.recoverText}
            textDecorationLine="underline"
            fontSize={14}
            color="primary"
            testID="recoverPhrase"
          >
            {'Or, recover from pass phrase'}
          </Section.Text>
        </TouchableOpacity>
      </Section.Row>
      <Section.Row alignItems="center" justifyContent="center">
        <TouchableOpacity onPress={goToSupport}>
          <Section.Text
            fontWeight="medium"
            style={styles.haveIssuesText}
            textDecorationLine="underline"
            fontSize={14}
            color="primary"
          >
            {'Still having issues? contact support'}
          </Section.Text>
        </TouchableOpacity>
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
    backRouteName: 'Auth',
  }
)
