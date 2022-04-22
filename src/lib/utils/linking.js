// @flow

import { Linking, Platform } from 'react-native'
import { nth } from 'lodash'

const schemeRe = /(.+?:)\/\//

export const openLink = async (uri: string, target: '_blank' | '_self' = '_blank', noopener: boolean = false) => {
  const isSchemeSupported = await Linking.canOpenURL(uri)

  if (!isSchemeSupported) {
    const [, scheme] = schemeRe.exec(uri)

    throw new Error(`There aren't apps installed can handle '${scheme}' scheme`)
  }

  if (Platform.OS === 'web') {
    const args = [new URL(uri, window.location).toString(), target]

    if (noopener) {
      args.push('noopener')
    }

    window.open(...args)
    return
  }

  return Linking.openURL(uri)
}

export const parseLinkForNavigation = (link: string) => {
  const [path, params = ''] = link.split('?')
  const route = nth(path.split('/'), -1)

  const formattedParams = params.split('&').reduce((acc, param) => {
    const [key, value] = param.split('=')
    return { ...acc, [key]: value }
  }, {})

  return [route, formattedParams]
}
