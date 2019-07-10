import DefaultTheme from 'react-native-paper/src/styles/DefaultTheme'
import normalize from 'react-native-elements/src/helpers/normalizeText'

export const theme = {
  ...DefaultTheme,
  borders: {
    defaultBorderColor: '#c9c8c9'
  },
  colors: {
    ...DefaultTheme.colors,
    blue: '#006EA0',
    darkBlue: '#0C263D',
    darkGray: '#42454A',
    gray50Percent: '#CBCBCB',
    green: '#00C3AE',
    lightGray: '#EEE',
    orange: '#F8AF40',
    primary: '#00AFFF',
    purple: '#9F6A9D',
    red: '#FA6C77',
    text: '#222'
  },
  fonts: {
    ...DefaultTheme.fonts,
    slab: 'RobotoSlab-Regular',
    slabBold: 'RobotoSlab-Bold'
  },
  paddings: {
    mainContainerPadding: normalize(8)
  },
  fontStyle: {
    color: '#555',
    fontSize: normalize(18),
    textAlign: 'center'
  },
  modals: {
    overlayBackgroundColor: 'rgba(255, 255, 255, 0.8)',
    overlayHorizontalPadding: normalize(20),
    overlayVerticalPadding: normalize(30),
    backgroundColor: '#fff',
    jaggedEdgeSize: normalize(15),
    contentPadding: normalize(16),
    borderRadius: normalize(5),
    borderLeftWidth: normalize(10)
  }
}
