// @flow
import React from 'react'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import NavBar from '../appNavigation/NavBar'
import Section from '../common/layout/Section'
import Circle from '../common/view/Circle'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'

import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Signin/illustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
type Props = {
  navigation: any,
  screenProps: {
    push: Function,
  },
  styles: any,
}

Image.prefetch(illustration)

class Signin extends React.Component<Props> {
  handleSignIn = () => {
    this.props.navigation.navigate('Auth')
  }

  handleRecover = () => {
    this.props.navigation.navigate('Recover')
  }

  render() {
    const { styles } = this.props
    return (
      <View style={{ flexGrow: 1 }}>
        <NavBar goBack={this.handleSignIn} title={'SIGN IN'} />
        <ScrollView contentContainerStyle={styles.scrollableContainer}>
          <View style={styles.contentContainer}>
            <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
              <Image source={illustration} style={styles.illustration} resizeMode="contain" />
              <Section.Stack grow justifyContent="flex-start">
                <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
                  <View style={styles.bottomContainer}>
                    <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
                      {'To sign in\n please follow this steps:'}
                    </Text>
                    <Text fontSize={14} color="gray80Percent" fontFamily="Roboto">
                      {`(works from any device or platform)`}
                    </Text>
                    <Section.Text>
                      <Circle number={1}>Go to your email</Circle>
                      <Circle number={2}>
                        Find{' '}
                        <Text fontWeight="bold" style={styles.text} fontFamily="Roboto">
                          GoodDollar magic mail
                        </Text>
                      </Circle>
                      <Circle number={3}>
                        Click the{' '}
                        <Text fontWeight="bold" style={styles.text} fontFamily="Roboto">
                          magic link
                        </Text>
                      </Circle>
                    </Section.Text>
                  </View>
                </Section.Row>
              </Section.Stack>
              <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
                <TouchableOpacity onPress={this.handleRecover}>
                  <Section.Text
                    fontWeight="medium"
                    style={styles.textBottom}
                    textDecorationLine="underline"
                    fontSize={14}
                    color="primary"
                  >
                    Or, recover from pass phrase
                  </Section.Text>
                </TouchableOpacity>
              </Section.Row>
            </Wrapper>
          </View>
        </ScrollView>
      </View>
    )
  }
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
      maxHeight: getDesignRelativeHeight(175),
      minHeight: getDesignRelativeHeight(95),
      paddingTop: theme.sizes.default,
    },
    text: {
      color: theme.colors.green,
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

Signin.navigationOptions = {
  title: 'Sign in',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(Signin)
