// @flow
import React from 'react'
import CustomButton from '../common/buttons/CustomButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import { withStyles } from '../../lib/styles'
import { SafeAreaView } from 'react-native'

type FooterProps = {
  valid?: boolean,
  submitText?: string,
  handleSubmit: () => any,
  loading?: boolean,
}

const Footer = ({ valid, submitText, handleSubmit, loading }: FooterProps) => {
  return (
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
    <SafeAreaView>
      <Wrapper backgroundColor="transparent" style={props.styles.wrapper}>
        <Section grow style={[props.styles.section, {backgroundColor: 'transparent'}]}>
          <Section.Stack grow justifyContent="space-evenly">
            {props.children}
          </Section.Stack>
          <Section.Row justifyContent="flex-end">
            {FooterComponent ? <FooterComponent {...props} /> : <Footer {...props} />}
          </Section.Row>
        </Section>
      </Wrapper>
    </SafeAreaView>
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
