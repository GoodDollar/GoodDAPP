import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'

export const modalStyles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: normalize(4),
    borderLeftWidth: normalize(10),
    borderRightWidth: normalize(2),
    borderTopWidth: normalize(2),
    borderBottomWidth: normalize(2),
    padding: normalize(30),
    borderColor: '#c9c8c9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    padding: 0,
  },
  leftMargin: {
    marginLeft: 'auto',
  },
  leftTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    flex: 1,
  },
  rightTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10),
  },
  label: {
    fontSize: normalize(10),
    color: 'black',
    display: 'inlineBlock',
  },
  name: {
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock',
  },
  currency: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
  },
})
