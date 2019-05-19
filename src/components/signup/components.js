// @flow
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Text } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { PushButton } from '../appNavigation/stackNavigation'

export const NextButton = (props: {
  valid?: boolean,
  handleSubmit: () => any,
  styles?: any,
  children: any,
  loading?: boolean
}) => (
  <Button
    style={[props.styles || {}, styles.continueButton]}
    mode="contained"
    color="#555555"
    dark={true}
    disabled={!props.valid || props.loading}
    loading={props.loading}
    onPress={props.handleSubmit}
  >
    <Text style={styles.buttonText}>{props.children}</Text>
  </Button>
)

export const ActionButton = (props: {
  disabled?: boolean,
  handleSubmit: () => any,
  styles?: any,
  children: any,
  loading?: boolean
}) => (
  <Button
    style={[styles.actionButton, props.styles || {}]}
    mode="outlined"
    color="#555"
    loading={props.loading}
    disabled={props.disabled}
    onPress={props.handleSubmit}
  >
    <Text style={styles.actionButtonText}>{props.children}</Text>
  </Button>
)

const Footer = (props: { valid?: boolean, submitText?: string, handleSubmit: () => any, loading?: boolean }) => {
  return (
    <React.Fragment>
      <NextButton valid={props.valid} handleSubmit={props.handleSubmit} loading={props.loading}>
        {props.submitText || 'Next'}
      </NextButton>
    </React.Fragment>
  )
}

export const Wrapper = (props: any) => {
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

export const LinkButton = (props: any) => (
  <Text style={[styles.linkButton, props.style]} onPress={props.onPress}>
    {props.children}
  </Text>
)

export const Title = (props: any) => <Text style={[styles.title, props.style]}>{props.children}</Text>

export const Description = (props: any) => <Text style={[styles.description, props.style]}>{props.children}</Text>

export const Error = (props: any) => (
  <View style={styles.errorWrapper}>
    <Text style={[styles.error, props.style]}>{props.children}</Text>
  </View>
)

const fontStyle = {
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
  actionButton: {
    borderStyle: 'solid',
    borderColor: '#555',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5
  },
  actionButtonText: {
    color: '#555'
  },
  title: {
    ...fontStyle,
    fontSize: normalize(24),
    marginBottom: normalize(30)
  },
  description: {
    ...fontStyle,
    marginTop: normalize(30)
  },
  errorWrapper: {},
  error: {
    ...fontStyle,
    color: 'red',
    marginVertical: normalize(30),
    minHeight: normalize(24)
  }
})
