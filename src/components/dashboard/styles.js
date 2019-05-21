import normalize from 'react-native-elements/src/helpers/normalizeText'
import { StyleSheet } from 'react-native'

import { fontStyle } from '../common/styles'

export const receiveStyles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-start',
    width: '100%',
    padding: normalize(8)
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
    color: '#555555',
    fontSize: normalize(14),
    textTransform: 'uppercase'
  },
  lowerSecondaryText: {
    margin: '1rem',
    color: '#555555',
    fontSize: normalize(16)
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
  },
  shareQRButton: {
    width: '100%'
  },
  doneButton: {
    marginTop: '1rem'
  },
  fullWidth: {
    marginHorizontal: normalize(10)
  },
  amountSuffix: {
    flexGrow: 1,
    height: normalize(40),
    fontSize: normalize(10),
    justifyContent: 'center',
    lineHeight: normalize(40),
    paddingTop: normalize(10)
  },
  buttonStyle: {
    marginTop: '1em'
  }
})
