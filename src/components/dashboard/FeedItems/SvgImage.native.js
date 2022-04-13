import React from 'react'
// eslint-disable-next-line import/default
// import SvgUri from 'react-native-svg-uri'
import { SvgXml } from 'react-native-svg'

export const SvgImage = ({ src, width, height }) => <SvgXml xml={src} width={width} height={height} />
