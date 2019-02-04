// @flow
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { normalize } from 'react-native-elements'

export const NextButton = (props: { valid?: boolean, handleSubmit: () => any, styles: any, children: any }) => (
  <Button
    style={[props.styles, styles.continueButton]}
    mode="contained"
    color="#555555"
    dark={true}
    disabled={!props.valid}
    onPress={props.handleSubmit}
  >
    <Text style={styles.buttonText}>{props.children}</Text>
  </Button>
)

const Footer = props => {
  const showPrivacyPolicy = props.showPrivacyPolicy === undefined ? true : props.showPrivacyPolicy
  return (
    <React.Fragment>
      <NextButton valid={props.valid} handleSubmit={props.handleSubmit}>
        {props.submitText || 'Next'}
      </NextButton>
      {showPrivacyPolicy && <LinkButton onPress={() => console.log('Link button')}>Privacy Policy</LinkButton>}
    </React.Fragment>
  )
}

export const Wrapper = props => {
  const { footerComponent: FooterComponent } = props
  return (
    <View style={styles.wrapper} {...props}>
      <View style={styles.topContainer}>{props.children}</View>
      <View style={styles.bottomContainer}>
        {FooterComponent ? <FooterComponent {...props} /> : <Footer {...props} />}
      </View>
    </View>
  )
}

export const LinkButton = props => (
  <Text style={[props.styles, styles.linkButton]} onPress={props.onPress}>
    {props.children}
  </Text>
)

export const Title = props => <Text style={[styles.title, props.style]}>{props.children}</Text>

export const Description = props => <Text style={[styles.description, props.style]}>{props.children}</Text>

const fontStyle = {
  fontFamily: 'Helvetica, "sans-serif"',
  color: '#555',
  fontSize: normalize(18),
  textAlign: 'center'
}
const styles = StyleSheet.create({
  buttonText: {
    ...fontStyle,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: normalize(10)
  },
  wrapper: {
    display: 'flex',
    maxWidth: '500px',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'column',
    padding: normalize(20)
  },
  linkButton: {
    color: '#555',
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(18),
    textAlign: 'center',
    marginTop: normalize(10)
  },
  topContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: normalize(30)
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end'
  },
  continueButton: {
    marginBottom: '10px',
    paddingTop: 5,
    paddingBottom: 5
  },
  title: {
    ...fontStyle,
    fontSize: normalize(28),
    marginBottom: normalize(30)
  },
  description: {
    ...fontStyle,
    marginTop: normalize(30)
  }
})
