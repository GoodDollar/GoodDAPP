// @flow
import React from 'react'
import createIconSetFromFontello from 'react-native-vector-icons/lib/create-icon-set-from-fontello'
import fontelloConfig from './config.json'
const Icon = createIconSetFromFontello(fontelloConfig)

type IconProps = {
  name: string,
  color?: string,
  size?: number,
  style?: {}
}

export default (props: IconProps) => <Icon size={props.size || 16} color={props.color || 'black'} {...props} />
