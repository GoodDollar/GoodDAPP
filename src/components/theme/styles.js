import DefaultTheme from 'react-native-paper/src/styles/DefaultTheme'
import normalize from 'react-native-elements/src/helpers/normalizeText'

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    blue: '#006EA0',
    darkBlue: '#0C263D',
    darkGray: '#42454A',
    gray: '#555',
    gray50Percent: '#CBCBCB',
    placeholder: '#CBCBCB',
    green: '#00C3AE',
    lightGray: '#EEE',
    orange: '#F8AF40',
    primary: '#00AFFF',
    purple: '#9F6A9D',
    red: '#FA6C77',
    text: '#222',
    error: '#FA6C77',
  },
  fonts: {
    ...DefaultTheme.fonts,
    slab: 'RobotoSlab-Regular',
    slabBold: 'RobotoSlab-Bold',
    bold: 'Roboto-Bold',
  },
  paddings: {
    mainContainerPadding: normalize(8),
    defaultMargin: normalize(8),
  },
  sizes: {
    default: normalize(8),
    defaultDouble: normalize(16),
    defaultHalf: normalize(4),
  },
  fontStyle: {
    color: '#555',
    fontSize: normalize(18),
    textAlign: 'center',
  },
}
