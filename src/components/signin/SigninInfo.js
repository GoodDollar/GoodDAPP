// @flow
import React from 'react'
import { AsyncStorage, Image, TouchableOpacity, View } from 'react-native'
import Section from '../common/layout/Section'
import Circle from '../common/view/Circle'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'

import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Signin/illustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { createStackNavigator } from '../appNavigation/stackNavigation'

Image.prefetch(illustration)

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
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <View style={styles.bottomContainer}>
            <Section.Text>
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
            </Section.Text>
          </View>
        </Section.Row>
      </Wrapper>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <TouchableOpacity onPress={handleRecover}>
          <Section.Text
            fontWeight="medium"
            style={styles.recoverText}
            textDecorationLine="underline"
            fontSize={14}
            color="primary"
          >
            {'Or, recover from pass phrase'}
          </Section.Text>
        </TouchableOpacity>
      </Section.Row>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
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
      justifyContent: 'space-evenly',
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginTop: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(30),
      maxWidth: '100%',
      maxHeight: getDesignRelativeHeight(142, false),
      minHeight: getDesignRelativeHeight(95, false),
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
