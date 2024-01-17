// @flow
import React from 'react'
import { debounce } from 'lodash'
import { t } from '@lingui/macro'
import { validateFullName } from '../../lib/validators/validateFullName'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'
import InputText from '../common/form/InputText'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import CustomWrapper from './signUpWrapper'

type Props = {
  doneCallback: ({ name: string }) => null,
  screenProps: any,
  navigation: any,
  styles: any,
}

type State = {
  errorMessage: string,
  fullName: string,
}

export type NameRecord = {
  fullName: string,
}

class NameForm extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    const { fullName = '', torusProvider = '' } = props.screenProps.data
    const errorMessage = validateFullName(fullName)

    this.state = {
      errorMessage: '',
      isValid: errorMessage === '',
      fullName,
      torusProvider,
    }
  }

  input = undefined

  handleChange = (fullName: string) => {
    fullName = fullName.trimLeft()
    this.checkErrorsSlow()
    this.setState({ fullName })
  }

  handleSubmit = () => {
    const { fullName } = this.state
    const isValid = this.checkErrors()
    if (isValid) {
      this.props.screenProps.doneCallback({ fullName: fullName.trim() })
    }
  }

  checkErrors = () => {
    const errorMessage = validateFullName(this.state.fullName)
    this.setState({ errorMessage, isValid: errorMessage === '' })
    return errorMessage === ''
  }

  checkErrorsSlow = debounce(this.checkErrors, 500)

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter') {
      this.handleSubmit()
    }
  }

  render() {
    const { fullName, errorMessage, torusProvider } = this.state
    const { key } = this.props.navigation.state
    const { styles } = this.props
    const { loading } = this.props.screenProps.data
    return (
      <CustomWrapper
        valid={this.state.isValid}
        loading={loading}
        handleSubmit={this.handleSubmit}
        style={this.props.styles.transparentBackground}
      >
        <Section grow justifyContent="flex-start" style={styles.transparentBackground}>
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Text
              color={'primary'}
              fontSize={getDesignRelativeHeight(12)}
              lineHeight={getDesignRelativeHeight(21)}
              letterSpacing={0.26}
              fontFamily="Roboto"
              fontWeight="bold"
              textTransform="uppercase"
              style={{ marginBottom: getDesignRelativeHeight(14) }}
            >
              {t`Personal Details`}
            </Text>
            <Section.Stack justifyContent="center" style={styles.row}>
              {torusProvider.includes('auth0') && (
                <Section.Title
                  color="darkIndigo"
                  fontSize={18}
                  fontWeight="400"
                  textTransform="none"
                  style={{ marginVertical: 0 }}
                >
                  {t`Thanks, we verified your phone.`}
                </Section.Title>
              )}
              <Section.Title
                color="darkIndigo"
                fontSize={18}
                fontWeight="500"
                textTransform="none"
                style={{ marginVertical: 0 }}
              >
                {t`What is your full name?`}
              </Section.Title>
            </Section.Stack>
            <Section.Stack justifyContent="center" style={styles.bottomRow}>
              <InputText
                id={key + '_input'}
                value={fullName}
                onChangeText={this.handleChange}
                error={errorMessage}
                onKeyPress={this.handleEnter}
                showCleanAdornment
                autoFocus
                style={styles.transparentBackground}
                enablesReturnKeyAutomatically
                onSubmitEditing={this.handleSubmit}
              />
              {!errorMessage ? (
                <Text
                  color={'lightBlue'}
                  fontSize={getDesignRelativeHeight(14)}
                  lineHeight={getDesignRelativeHeight(16)}
                  letterSpacing={0.14}
                  fontFamily="Roboto"
                >
                  {t`This can't be changed later.`}
                </Text>
              ) : null}
            </Section.Stack>
          </Section.Stack>
        </Section>
      </CustomWrapper>
    )
  }
}

NameForm.navigationOptions = {
  title: 'Name',
}

const getStylesFromProps = ({ theme }) => ({
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  row: {
    marginVertical: theme.sizes.defaultDouble,
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
  },
  bottomRow: {
    marginTop: 'auto',
    marginBottom: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(NameForm)
