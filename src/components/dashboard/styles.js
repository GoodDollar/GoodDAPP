import normalize from 'react-native-elements/src/helpers/normalizeText'
import { StyleSheet } from 'react-native'
import { theme } from '../theme/styles'
import { getScreenHeight } from '../../lib/utils/Orientation'

const isMobileHeight = getScreenHeight() < 680

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
    marginTop: isMobileHeight ? 0 : '2rem',
    padding: '1rem',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: '4px'
  },
  addressSection: {
    marginBottom: isMobileHeight ? 0 : '1rem'
  },
  address: {
    margin: '0.5rem'
  },
  secondaryText: {
    margin: isMobileHeight ? '0.2rem' : '1rem',
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
    ...theme.fontStyle,
    textTransform: 'uppercase',
    marginBottom: '1rem',
    fontSize: normalize(24)
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    marginTop: '1rem'
  },
  amountLabel: {
    ...theme.fontStyle,
    fontSize: normalize(32)
  },
  amountSymbol: {
    fontSize: normalize(12)
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
