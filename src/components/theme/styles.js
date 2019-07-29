import DefaultTheme from 'react-native-paper/src/styles/DefaultTheme'
import normalize from '../../lib/utils/normalizeText'

export const theme = {
  ...DefaultTheme,
  borders: {
    defaultBorderColor: '#c9c8c9',
  },
  colors: {
    ...DefaultTheme.colors,
    blue: '#006EA0',
    darkBlue: '#0C263D',
    darkGray: '#42454A',
    gray: '#555',
    gray50Percent: '#CBCBCB',
    gray80Percent: '#A3A3A3',
    placeholder: '#CBCBCB',
    green: '#00C3AE',
    lightGray: '#EEE',
    lighterGray: '#A3A3A3',
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
    medium: 'Roboto-Medium',
    regular: 'Roboto',
  },
  paddings: {
    mainContainerPadding: 8,
    defaultMargin: 8,
  },
  sizes: {
    default: 8,
    defaultDouble: 16,
    defaultQuadruple: 32,
    defaultHalf: 4,
    borderRadius: 5,
  },
  fontStyle: {
    color: '#555',
    fontSize: normalize(18),
    textAlign: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
  },
  modals: {
    overlayBackgroundColor: 'rgba(255, 255, 255, 0.8)',
    overlayHorizontalPadding: 20,
    overlayVerticalPadding: 30,
    backgroundColor: '#fff',
    jaggedEdgeSize: 15,
    contentPadding: 16,
    borderRadius: 5,
    borderLeftWidth: 10,
  },
  feedItems: {
    borderRadius: 8,
    itemBackgroundColor: '#fff',
    height: 84,
  },
}
