import React from 'react'
// eslint-disable-next-line import/default
import SvgUri from 'react-native-svg-uri'

export const SvgImage = ({ src, width, height }) => <SvgUri width={width} height={height} svgXmlData={src} />
