// @flow
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { fontStyle } from '../styles'
import Text from '../view/Text'

const getFlexStylesFromProps = props => {
  const { justifyContent, alignItems, grow } = props
  const flex = Number.isFinite(grow) ? grow : grow ? 1 : undefined
  let styles = {}
  if (justifyContent) {
    styles.justifyContent = justifyContent
  }
  if (alignItems) {
    styles.alignItems = alignItems
  }
  if (flex) {
    styles.flex = flex
  }
  return styles
}

const Row = (props: any) => (
  <View {...props} style={[styles.sectionRow, getFlexStylesFromProps(props), props.style]}>
    {props.children}
  </View>
)
const Stack = (props: any) => (
  <View {...props} style={[styles.sectionStack, getFlexStylesFromProps(props), props.style]}>
    {props.children}
  </View>
)
const Title = (props: any) => (
  <Text {...props} style={[styles.title, props.style]}>
    {props.children}
  </Text>
)
const SectionText = (props: any) => <Text {...props} style={[styles.text, props.style]} />
const Separator = () => <hr style={{ width: '100%' }} />

export default class Section extends Component<any> {
  static Row = Row

  static Stack = Stack

  static Title = Title

  static Text = SectionText

  static Separator = Separator

  render() {
    return (
      <View style={[styles.section, getFlexStylesFromProps(this.props), this.props.style]}>{this.props.children}</View>
    )
  }
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#ffffff',
    borderRadius: normalize(5),
    padding: normalize(8)
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  title: {
    ...fontStyle,
    fontSize: normalize(24),
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: normalize(16),
    marginTop: normalize(16)
  },
  text: {
    ...fontStyle,
    fontSize: normalize(14)
  }
})
