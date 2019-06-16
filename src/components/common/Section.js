// @flow
import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { fontStyle } from './styles'

const Row = (props: any) => (
  <View {...props} style={[styles.sectionRow, props.style]}>
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
  static Title = Title
  static Text = SectionText
  static Separator = Separator

  render() {
    return <View style={[styles.section, this.props.style]}>{this.props.children}</View>
  }
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#eeeeef',
    borderRadius: normalize(5),
    padding: normalize(10),
    paddingTop: normalize(15),
    paddingBottom: normalize(15),
    marginBottom: normalize(15)
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    ...fontStyle
  },
  text: {
    ...fontStyle,
    fontSize: normalize(14)
  }
})
