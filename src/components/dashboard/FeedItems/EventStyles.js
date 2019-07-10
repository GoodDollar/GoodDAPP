import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'

export const listStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: normalize(4),
    backgroundColor: '#fff',
    borderRadius: normalize(8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.16,
    shadowRadius: normalize(4),
    elevation: 1,
    height: normalize(84),
    maxHeight: normalize(84)
  },
  rowContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingLeft: normalize(8),
    paddingRight: normalize(4)
  },
  avatatBottom: {
    alignSelf: 'flex-end'
  },
  mainSection: {
    marginLeft: normalize(4)
  },
  rowContentBorder: {
    backgroundRepeat: 'no-repeat',
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: normalize(8),
    backgroundSize: 'initial'
  },
  innerRow: {
    padding: normalize(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  rowIcon: {
    width: 64,
    height: 64,
    marginRight: 20,
    borderRadius: '50%',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
  },
  rowData: {
    flex: 1
  },
  rowDataText: {
    fontSize: normalize(16),
    textTransform: 'capitalize',
    color: '#555'
  },
  rowDataSubText: {
    fontSize: normalize(10),
    color: '#A3A3A3',
    marginTop: normalize(4),
    textTransform: 'capitalize'
  },
  direction: {
    fontWeight: '500',
    fontSize: normalize(8)
  },
  fullName: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(16)
  },
  contentColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderBottomWidth: 0,
    marginBottom: 0,
    padding: 0
  },
  rightContentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  date: {
    fontSize: normalize(10),
    color: 'rgba(75, 75, 75, 0.8)',
    marginLeft: 'auto',
    fontFamily: 'Roboto-Regular'
  },
  eventIcon: {
    marginRight: 0
  },
  emptyBlock: {
    backgroundColor: '#eee'
  },
  emptyBlockBorderRow: {
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    borderBottomWidth: normalize(2),
    paddingBottom: normalize(4),
    marginBottom: normalize(4)
  }
})

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
    borderColor: '#c9c8c9'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    padding: 0
  },
  leftMargin: {
    marginLeft: 'auto'
  },
  leftTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    flex: 1
  },
  rightTitle: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  },
  label: {
    fontSize: normalize(10),
    color: 'black',
    display: 'inlineBlock'
  },
  name: {
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  },
  currency: {
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  }
})
