import { StyleSheet, Platform } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'

export const modalStyles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderLeftWidth: 10,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    padding: 30,
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
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 10,
    marginTop: 10,
  },
  label: {
    fontSize: normalize(10),
    color: 'black',
    display: Platform.select({
      web: 'inlineBlock',
      default: 'flex',
    }),
  },
  name: {
    fontSize: normalize(14),
    color: 'black',
    display: Platform.select({
      web: 'inlineBlock',
      default: 'flex',
    }),
  },
  currency: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
  },
})
