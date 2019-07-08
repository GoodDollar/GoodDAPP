// @flow
import React, { Component } from 'react'
import { View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import SectionRow from './SectionRow'
import SectionStack from './SectionStack'
import SectionTitle from './SectionTitle'
import SectionText from './SectionText'
import { getFlexStylesFromProps } from './SectionUtils'

const Separator = () => <hr style={{ width: '100%' }} />

class Section extends Component<any> {
  static Row = SectionRow

  static Stack = SectionStack

  static Title = SectionTitle

  static Text = SectionText

  static Separator = Separator

  render() {
    const { styles } = this.props

    return (
      <View style={[styles.section, getFlexStylesFromProps(this.props), this.props.style]}>{this.props.children}</View>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    section: {
      backgroundColor: '#fff',
      borderRadius: normalize(5),
      padding: normalize(8)
    }
  }
}

export default withStyles(getStylesFromProps)(Section)
