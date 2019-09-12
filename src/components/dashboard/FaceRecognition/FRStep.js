import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import Text from '../../common/view/Text'
import Icon from '../../common/view/Icon'
import normalize from '../../../lib/utils/normalizeText'
import logger from '../../../lib/logger/pino-logger'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'

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
  let color = isActive === false ? 'gray50Percen' : status === false ? 'red' : 'darkGray'
  return (
    <View style={[styles.topContainer, { paddingBottom }]}>
      <View style={styles.mainView}>
        <Text color={color} fontWeight={isActive && 'medium'} lineHeight={28}>
          {title}
        </Text>
      </View>
      {iconOrSpinner}
    </View>
  )
}
const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    flexDirection: 'row',
    paddingTop: 0,
    marginRight: 0,
  },
  mainView: {
    flexGrow: 2,
  },
  steps: {
    marginBottom: 22,
    marginTop: 22,
  },
  statusIcon: {
    justifyContent: 'center',
  },
  textActive: {
    fontSize: normalize(16),
    color: theme.colors.darkGray,
    textTransform: 'none',
    lineHeight: 28,
  },
  textInactive: {
    fontSize: normalize(16),
    color: theme.colors.gray50Percent,
    textTransform: 'none',
    lineHeight: 28,
  },
  textError: {
    fontSize: normalize(16),
    color: theme.colors.red,
    textTransform: 'none',
    lineHeight: 28,
  },
  success: {
    width: getDesignRelativeWidth(28),
    height: getDesignRelativeHeight(28),
    borderRadius: '50%',
    backgroundColor: theme.colors.green,
  },
  failure: {
    width: getDesignRelativeWidth(28),
    height: getDesignRelativeHeight(28),
    borderRadius: '50%',
    backgroundColor: theme.colors.red,
    flexGrow: 0,
  },
})
export default withStyles(getStylesFromProps)(FRStep)
