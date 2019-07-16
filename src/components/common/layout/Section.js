// @flow
import React from 'react'
import { View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import SectionRow from './SectionRow'
import SectionStack from './SectionStack'
import SectionTitle from './SectionTitle'
import SectionText from './SectionText'
import { getFlexStylesFromProps } from './SectionUtils'

const Separator = () => <hr style={{ width: '100%' }} />

const SectionComponent = props => {
  const { styles, children, style } = props
  return <View style={[styles.section, getFlexStylesFromProps(props), style]}>{children}</View>
}

const mapPropsToStyles = ({ theme }) => ({
  section: {
    backgroundColor: '#fff',

    borderRadius: theme.sizes.borderRadius,
    padding: normalize(12),
    paddingTop: theme.sizes.defaultDouble,
    paddingBottom: theme.sizes.defaultDouble,
  },
})

const Section = withStyles(mapPropsToStyles)(SectionComponent)

Section.Title = SectionTitle
Section.Row = SectionRow
Section.Text = SectionText
Section.Stack = SectionStack
Section.Separator = Separator

export default Section
