import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Text } from 'react-native-paper'
import Icon from '../../common/view/Icon'
import logger from '../../../lib/logger/pino-logger'
import { withStyles } from '../../../lib/styles'

const log = logger.child({ from: 'GuidedFRProcessResults' })

const FRStep = ({ title, isActive, status, isProcessFailed, paddingBottom, styles }) => {
  paddingBottom = paddingBottom === undefined ? 12 : paddingBottom
  let statusColor = status === true ? 'success' : status === false ? 'failure' : 'none'
  let statusIcon =
    status === undefined ? null : (
      <Icon name={status ? 'success' : 'close'} size={14} color="#fff" style={{ textAlign: 'center' }} />
    )
  let spinner =
    isProcessFailed !== true && status === undefined && isActive === true ? <ActivityIndicator color={'gray'} /> : null
  let iconOrSpinner =
    statusIcon || spinner ? <View style={[styles[statusColor], styles.statusIcon]}>{statusIcon || spinner}</View> : null

  //not active use grey otherwise based on status
  let textStyle = isActive === false ? styles.textInactive : status === false ? styles.textError : styles.textActive
  log.debug('FRStep', { title, status, isActive, statusColor, textStyle })

  return (
    <View style={[styles.topContainer,{paddingBottom}]}>
      <View style={styles.mainView}>
        <Text style={textStyle}>{title}</Text>
      </View>
      {iconOrSpinner}
    </View>
  )
}
const getStylesFromProps = ({ theme }) => ({
  topContainer:{
    flexDirection: 'row',
    paddingTop: 0,
    marginRight: 0,
  },
  mainView:{
    flexGrow: 2
  },
  steps:{
    marginBottom: '1.375rem',
    marginTop: '1.375rem'
  },
  statusIcon: {
    justifyContent: 'center',
  },
  textActive: {
    fontSize: '1rem',
    color: theme.colors.darkGray,
    textTransform: 'none',
    lineHeight: '1.75rem',
  },
  textInactive: {
    fontSize: '1rem',
    color: theme.colors.gray50Percent,
    textTransform: 'none',
    lineHeight: '1.75rem',
  },
  textError: {
    fontSize: '1rem',
    color: theme.colors.red,
    textTransform: 'none',
    lineHeight: '1.75rem',
  },
  success: {
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '50%',
    backgroundColor: theme.colors.green,
  },
  failure: {
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '50%',
    backgroundColor: theme.colors.red,
    flexGrow: 0,
  },
})
export default withStyles(getStylesFromProps)(FRStep)
