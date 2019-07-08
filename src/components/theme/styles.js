import DefaultTheme from 'react-native-paper/src/styles/DefaultTheme'
import normalize from 'react-native-elements/src/helpers/normalizeText'

// export const colors = {
//   blue: '#006EA0',
//   darkBlue: '#0C263D',
//   darkGray: '#42454A',
//   gray50Percent: '#CBCBCB',
//   green: '#00C3AE',
//   lightGray: '#EEE',
//   orange: '#F8AF40',
//   primary: '#00AFFF',
//   purple: '#9F6A9D',
//   red: '#FA6C77',
//   text: '#222'
// }

// export const paddings = {
//   mainContainerPadding: normalize(8)
// }

// export const fontStyle = {
//   color: '#555',
//   fontSize: normalize(18),
//   textAlign: 'center'
// }

// export const scrollableContainer = {
//   flexGrow: 1
// }

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00AFFF',
    text: '#222',
    blue: '#006EA0',
    darkBlue: '#0C263D',
    darkGray: '#42454A',
    gray50Percent: '#CBCBCB',
    green: '#00C3AE',
    lightGray: '#EEE',
    orange: '#F8AF40',
    purple: '#9F6A9D',
    red: '#FA6C77'
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
  }
}
