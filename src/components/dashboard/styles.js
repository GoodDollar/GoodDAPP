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
    marginBottom: '1rem'
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
    alignContent: 'center',
    borderBottom: '1px solid #555'
  },
  amountInput: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: normalize(26),
    height: normalize(40),
    lineHeight: normalize(40),
    maxWidth: '50%',
    flexShrink: 1,
    flexGrow: 1,
    textAlign: 'justify',
    textAlignLast: 'right',
    whiteSpace: 'normal',
    marginRight: normalize(-5)
  },
  amountSuffix: {
    flexGrow: 1,
    height: normalize(40),
    fontSize: normalize(10),
    justifyContent: 'center',
    lineHeight: normalize(40),
    paddingTop: normalize(10)
  }
})
