import DefaultTheme from 'react-native-paper/src/styles/DefaultTheme'
import normalize from 'react-native-elements/src/helpers/normalizeText'

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    blue: '#006EA0',
    darkBlue: '#0C263D',
    darkGray: '#42454A',
    feedback: '#00afff',
    gray50Percent: '#CBCBCB',
    green: '#00C3AE',
    lightGray: '#EEE',
    message: '#9f6a9d',
    notification: '#f8af40',
    orange: '#F8AF40',
    primary: '#00AFFF',
    purple: '#9F6A9D',
    receive: '#00c3ae',
    red: '#FA6C77',
    send: '#fa6c77',
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
  }
}
