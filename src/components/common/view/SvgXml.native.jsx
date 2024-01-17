import React from 'react'
import { SvgXml as SVG } from 'react-native-svg'

const SvgXml = ({ src, width, height }) => <SVG xml={src} width={width} height={height} />

export default SvgXml
