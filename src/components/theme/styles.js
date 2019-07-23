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
    mainContainerPadding: normalize(8),
    defaultMargin: normalize(8),
  },
  sizes: {
    default: normalize(8),
    defaultDouble: normalize(16),
    defaultQuadruple: normalize(32),
    defaultHalf: normalize(4),
    borderRadius: normalize(5),
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
    overlayHorizontalPadding: normalize(20),
    overlayVerticalPadding: normalize(30),
    backgroundColor: '#fff',
    jaggedEdgeSize: normalize(15),
    contentPadding: normalize(16),
    borderRadius: normalize(5),
    borderLeftWidth: normalize(10),
  },
  feedItems: {
    borderRadius: normalize(8),
    itemBackgroundColor: '#fff',
    height: normalize(84),
  },
}
