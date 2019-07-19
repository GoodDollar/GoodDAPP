// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { CustomButton, Section, Text, Wrapper } from '../common'

export const NextButton = (props: {
  valid?: boolean,
  handleSubmit: () => any,
  styles?: any,
  children: any,
  loading?: boolean,
}) => (
  <CustomButton
    style={[styles.nextButton, props.styles]}
    disabled={!props.valid || props.loading}
    loading={props.loading}
    onPress={props.handleSubmit}
  >
    <Text style={styles.buttonText}>{props.children}</Text>
  </CustomButton>
)

export const ActionButton = (props: {
  disabled?: boolean,
  handleSubmit: () => any,
  styles?: any,
  children: any,
  loading?: boolean,
}) => (
  <CustomButton
    style={[styles.actionButton, props.styles || {}]}
    mode="outlined"
    color="#555"
    loading={props.loading}
    disabled={props.disabled}
    onPress={props.handleSubmit}
  >
    <Text style={styles.actionButtonText}>{props.children}</Text>
  </CustomButton>
)

const Footer = (props: { valid?: boolean, submitText?: string, handleSubmit: () => any, loading?: boolean }) => {
  return (
    <NextButton valid={props.valid} handleSubmit={props.handleSubmit} loading={props.loading}>
      {props.submitText || 'Next'}
    </NextButton>
  )
}

export const CustomWrapper = (props: any) => {
  const { footerComponent: FooterComponent } = props
  return (
    <Wrapper backgroundColor="#fff" style={{ padding: normalize(16) }}>
      <Section grow style={{ padding: 0 }}>
        <Section.Stack grow justifyContent="space-evenly">
          {props.children}
        </Section.Stack>
        <Section.Row justifyContent="flex-end">
          {FooterComponent ? <FooterComponent {...props} /> : <Footer {...props} />}
        </Section.Row>
      </Section>
    </Wrapper>
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
  textAlign: 'center',
}

const styles = StyleSheet.create({
  wrapperSection: {
    paddingVertical: normalize(8),
  },
  nextButton: {
    flex: 1,
    paddingVertical: normalize(4),
  },
  buttonText: {
    ...fontStyle,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: normalize(10),
  },
  wrapper: {
    display: 'flex',
    maxWidth: '475px',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'column',
    padding: normalize(20),
  },
  linkButton: {
    color: '#555',
    fontSize: normalize(18),
    textAlign: 'center',
    marginTop: normalize(10),
  },
  topContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: normalize(30),
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderStyle: 'solid',
    borderColor: '#555',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#555',
  },
  title: {
    ...fontStyle,
    fontSize: normalize(24),
    marginBottom: normalize(30),
  },
  description: {
    ...fontStyle,
    marginTop: normalize(30),
  },
  errorWrapper: {},
  error: {
    ...fontStyle,
    color: 'red',
    marginVertical: normalize(30),
    minHeight: normalize(24),
  },
})
