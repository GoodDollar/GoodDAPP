import { DefaultTheme } from 'react-native-paper'

import normalize from '../../lib/utils/normalizeText'
import { calculateFontFamily } from '../../lib/utils/fonts'

export const theme = {
  ...DefaultTheme,
  borders: {
    defaultBorderColor: '#c9c8c9',
  },
  colors: {
    ...DefaultTheme.colors,
    facebookBlue: '#0075FF',
    googleBlue: '#3367D6',
    blue: '#006EA0',
    darkBlue: '#0C263D',
    darkGray: '#42454A',
    gray: '#555',
    gray50Percent: '#CBCBCB',
    gray80Percent: '#A3A3A3',
    grayBox: '#E5E5E5',
    placeholder: '#CBCBCB',
    disabled: '#E3E3E2',
    green: '#00C3AE',
    lightGreen: '#00BBA5',
    lightGray: '#EEE',
    lighterGray: '#A3A3A3',
    secondary: '#A3A3A3',
    orange: '#F8AF40',
    primary: '#00AFFF',
    purple: '#9F6A9D',
    red: '#FA6C77',
    googleRed: '#D03737',
    error: '#FA6C77',
    text: '#222',
    white: '#ffffff',
    darkIndigo: '#173566',
  },
  fonts: {
    ...DefaultTheme.fonts,
    default: calculateFontFamily('Roboto'),
    slab: calculateFontFamily('Roboto Slab'),
  },
  paddings: {
    defaultMargin: 8,
    mainContainerPadding: 8,
  },
  sizes: {
    default: 8,
    defaultDouble: 16,
    defaultQuadruple: 32,
    defaultHalf: 4,
    borderRadius: 5,
    maxHeightForTabletAndDesktop: 844,
    maxContentHeightForTabletAndDesktop: 788, //without topbar which is 56
    minHeightForDialogMessage: 350,
    maxWidthForTabletAndDesktop: 475,
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
    overlayBackgroundColor: 'transparent',
    activityIndicatorBackgroundColor: 'rgba(255, 255, 255, 0.8)',
    overlayHorizontalPadding: 20,
    overlayVerticalPadding: 65,
    backgroundColor: '#fff',
    jaggedEdgeSize: 16,
    contentPadding: 16,
    borderRadius: 5,
    borderLeftWidth: 10,
  },
  feedItems: {
    borderRadius: 8,
    itemBackgroundColor: '#fff',
    height: normalize(84),
  },
}
