import React, { useCallback } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import Config from '../../../config/config'
import GiveUpButton from '../standalone/components/GiveUpButton'
import { CustomButton } from '../../common'
import { openLink } from '../../../lib/utils/linking'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'

const { fvTypeformUrl } = Config

const ErrorButtons = ({ styles, screenProps, navigation, onRetry, reachedMax, invert = false }) => {
  const onContactSupport = useCallback(() => openLink(fvTypeformUrl), [])

  return (
    <View style={styles.buttonsContainer}>
      {!reachedMax ? (
        <View style={{ flex: 1 }}>
          <CustomButton onPress={onRetry} style={styles.actionsSpace} mode={invert ? 'outlined' : undefined}>
            TRY AGAIN
          </CustomButton>
          <CustomButton onPress={onContactSupport} mode={invert ? undefined : 'outlined'}>
            {t`CONTACT SUPPORT`}
          </CustomButton>
        </View>
      ) : (
        <View>
          <GiveUpButton navigation={navigation} />
          <CustomButton onPress={onRetry} style={styles.actionsSpace}>
            TRY AGAIN
          </CustomButton>
        </View>
      )}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  buttonsContainer: {
    width: '100%',
  },
  actionsSpace: {
    marginTop: 10, //native design fix
    marginBottom: getDesignRelativeHeight(16),
  },
})

export default withStyles(getStylesFromProps)(ErrorButtons)
