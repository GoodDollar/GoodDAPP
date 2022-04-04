import React from 'react'
// eslint-disable-next-line import/default
import SvgUri from 'react-native-svg-uri-updated'

export const SvgImage = ({ src, width, height }) => <SvgUri width={width} height={height} svgXmlData={src} />
