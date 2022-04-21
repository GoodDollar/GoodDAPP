import React from 'react'
import { SvgXml } from 'react-native-svg'
import { Image } from 'react-native'

export const SvgImage = ({ src, width, height }) => <SvgXml xml={src} width={width} height={height} />

export const resolveAssetSource = Image.resolveAssetSource
