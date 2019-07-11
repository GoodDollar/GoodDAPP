import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'

const listRowMaxHeight = normalize(84)

export const listStyles = StyleSheet.create({
  row: {
    borderRadius: normalize(8),
    elevation: 1,
    flexDirection: 'row',
    height: listRowMaxHeight,
    marginBottom: normalize(4),
    maxHeight: listRowMaxHeight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.16,
    shadowRadius: normalize(4)
  },
  rowContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
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
    backgroundSize: 'initial',
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: normalize(8)
  },
  innerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: normalize(4),
    width: '100%'
  },
  rowIcon: {
    borderRadius: '50%',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)',
    height: 64,
    marginRight: 20,
    width: 64
  },
  rowData: {
    flex: 1
  },
  rowDataText: {
    color: '#555',
    fontSize: normalize(16),
    textTransform: 'capitalize'
  },
  rowDataSubText: {
    color: '#A3A3A3',
    fontSize: normalize(10),
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
    alignItems: 'flex-end',
    borderBottomWidth: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 0,
    padding: 0
  },
  rightContentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  date: {
    color: 'rgba(75, 75, 75, 0.8)',
    fontFamily: 'Roboto-Regular',
    fontSize: normalize(10),
    marginLeft: 'auto'
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
    marginBottom: normalize(4),
    paddingBottom: normalize(4)
  }
})

export const modalStyles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    borderBottomWidth: normalize(2),
    borderColor: '#c9c8c9',
    borderLeftWidth: normalize(10),
    borderRadius: normalize(4),
    borderRightWidth: normalize(2),
    borderTopWidth: normalize(2),
    flex: 1,
    padding: normalize(30)
  },
  row: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 0
  },
  leftMargin: {
    marginLeft: 'auto'
  },
  leftTitle: {
    color: 'black',
    flex: 1,
    fontSize: normalize(16),
    fontWeight: 'bold'
  },
  rightTitle: {
    color: 'black',
    fontSize: normalize(16),
    fontWeight: 'bold',
    textAlign: 'right'
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    marginBottom: normalize(10),
    marginTop: normalize(10),
    width: '100%'
  },
  label: {
    color: 'black',
    display: 'inlineBlock',
    fontSize: normalize(10)
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
