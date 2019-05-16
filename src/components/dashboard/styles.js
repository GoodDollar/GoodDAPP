import { normalize } from 'react-native-elements'
import { StyleSheet } from 'react-native'

import { fontStyle } from '../common/styles'

export const receiveStyles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-start',
    width: '100%',
    padding: '1rem'
  },
  section: {
    flex: 1
  },
  sectionRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
  },
  qrCode: {
    marginTop: '2rem',
    padding: '1rem',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: '4px'
  },
  addressSection: {
    marginBottom: '1rem'
  },
  address: {
    margin: '0.5rem'
  },
  secondaryText: {
    margin: '1rem',
    color: '#A2A2A2',
    textTransform: 'uppercase'
  },
  headline: {
    ...fontStyle,
    textTransform: 'uppercase',
    marginBottom: '1rem',
    fontSize: normalize(24)
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    marginTop: '1rem'
  },
  inputField: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  amountLabel: {
    ...fontStyle,
    fontSize: normalize(32)
  },
  amountSymbol: {
    fontSize: normalize(12)
  },
  amountWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center'
  },
  amountInput: {
    backgroundColor: 'transparent',
    height: normalize(40),
    width: '100%'
  },
  amountInputWrapper: {
    fontSize: normalize(26),
    lineHeight: normalize(40),
    whiteSpace: 'normal',
    flexShrink: 1,
    flexGrow: 1,
    textAlign: 'right'
  }
})
