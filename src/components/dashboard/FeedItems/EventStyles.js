import { StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'

export const listStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: 'rgb(238, 238, 239)',
    borderRadius: normalize(8),
    overflow: 'hidden'
  },
  rowContent: {
    padding: normalize(5),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderLeftWidth: normalize(8),
    borderLeftColor: 'rgb(186, 186, 186)'
  },
  innerRow: {
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
    fontSize: normalize(15),
    textTransform: 'capitalize',
    color: '#555'
  },
  rowDataSubText: {
    fontSize: normalize(15),
    color: '#A3A3A3',
    marginTop: 4,
    textTransform: 'capitalize'
  },
  currency: {
    fontSize: normalize(12)
  },
  direction: {
    fontWeight: 500,
    fontSize: normalize(10)
  },
  fullName: {
    fontWeight: 700
  },
  contentColumn: {
    flexDirection: 'column',
    justifyContent: 'right',
    alignItems: 'right',
    borderBottomWidth: 0,
    marginBottom: 0,
    padding: 0
  },
  rightContentRow: {
    flexDirection: 'row',
    justifyContent: 'right',
    alignItems: 'center'
  },
  date: {
    fontSize: normalize(8),
    color: 'rgba(75, 75, 75, 0.8)',
    marginLeft: 'auto'
  },
  eventIcon: {
    marginRight: 0
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
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    flex: 1
  },
  rightTitle: {
    fontFamily: 'Helvetica, "sans-serif"',
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
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(10),
    color: 'black',
    display: 'inlineBlock'
  },
  name: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  },
  currency: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  }
})
