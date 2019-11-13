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
            <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
              {'To sign in\n please follow these steps:'}
            </Text>
            <Text fontSize={14} color="gray80Percent" fontFamily="Roboto">
              {`(works from any device or platform)`}
            </Text>
          </View>
        </Section.Row>
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <View style={styles.bottomContainer}>
            <Section.Text style={styles.blockCircle}>
              <Circle number={1}>Go to your email</Circle>
              <Circle number={2}>
                Find{' '}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  GoodDollar magic link
                </Text>
              </Circle>
              <Circle number={3}>
                {'Click the '}
                <Text fontWeight="bold" fontSize={18} fontFamily="Roboto">
                  magic link
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
            style={styles.textBottom}
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
            style={styles.textBottom}
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
      marginTop: 30,
      marginBottom: 30,
      maxWidth: '100%',
      maxHeight: getDesignRelativeHeight(142),
      minHeight: getDesignRelativeHeight(95),
      paddingTop: theme.sizes.default,
    },
    text: {
      color: theme.colors.green,
    },
    blockCircle: {
      marginTop: 24,
    },
    textBottom: {
      marginBottom: 24,
    },
    contentContainer: {
      flexGrow: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    scrollableContainer: {
      flexGrow: 1,
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
