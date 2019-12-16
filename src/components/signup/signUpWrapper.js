// @flow
import React from 'react'
import SimpleStore from '../../lib/undux/SimpleStore'
import CustomButton from '../common/buttons/CustomButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import { withStyles } from '../../lib/styles'
type FooterProps = {
  valid?: boolean,
  submitText?: string,
  handleSubmit: () => any,
  loading?: boolean,
}

const Footer = ({ valid, submitText, handleSubmit, loading }: FooterProps) => {
  const simpleStore = SimpleStore.useStore()
  const isShowKeyboard = simpleStore.get && simpleStore.get('isMobileKeyboardShown')
  return isShowKeyboard ? null : (
    <CustomButton disabled={!valid || loading} loading={loading} onPress={handleSubmit} style={{ flex: 1 }}>
      {submitText}
    </CustomButton>
  )
}

Footer.defaultProps = {
  submitText: 'Next',
}

const CustomWrapper = (props: any) => {
  const { footerComponent: FooterComponent } = props
  return (
    <Wrapper backgroundColor={props.theme.colors.surface} style={props.styles.wrapper}>
      <Section grow style={props.styles.section}>
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

const getStylesFromProps = ({ theme }) => ({
  wrapper: {
    padding: theme.sizes.defaultDouble,
  },
  section: {
    padding: 0,
  },
})

export default withStyles(getStylesFromProps)(CustomWrapper)
