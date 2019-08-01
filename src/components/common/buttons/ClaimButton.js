// @flow
import React from 'react'
import { Text } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'

const ClaimButton = props => {
  const { screenProps, styles } = props

  return (
    <PushButton routeName={'Claim'} screenProps={screenProps} style={[styles.claimButton]}>
      <Text style={styles.buttonText}>Claim</Text>
    </PushButton>
  )
}

const getStylesFromProps = ({ theme }) => ({
  buttonText: {
    color: '#fff',
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    fontWeight: '500',
    margin: 0,
    textTransform: 'uppercase',
  },
  claimButton: {
    backgroundColor: theme.colors.green,
    borderColor: '#fff',
    borderRadius: '50%',
    borderWidth: 3,
    height: 72,
    left: '50%',
    marginHorizontal: 0,
    elevation: 0,
    padding: 3,
    position: 'absolute',
    top: '50%',
    width: 72,
    zIndex: 99,
    transform: [
      {
        translateX: '-50%',
      },
      {
        translateY: '-50%',
      },
    ],
  },
})

export default withStyles(getStylesFromProps)(ClaimButton)
