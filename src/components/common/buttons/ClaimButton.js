// @flow
import React from 'react'
import { Dimensions, Platform } from 'react-native'
import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'

const ClaimButton = ({ screenProps, styles }) => (
  <PushButton routeName="Claim" testID="claim_button" screenProps={screenProps} style={styles.claimButton}>
    Claim
  </PushButton>
)

const getStylesFromProps = ({ theme }) => ({
  claimButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.green,
    borderColor: theme.colors.surface,
    borderRadius: Platform.select({
      default: 72 / 2,
      web: '50%',
    }),
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
        translateX: Platform.select({
          web: '-50%',
          default: 0,
        }),
      },
      {
        translateY: Platform.select({
          web: '-50%',
          default: 0,
        }),
      },
    ],
  },
})

export default withStyles(getStylesFromProps)(ClaimButton)
