// @flow
import React from 'react'
import { PushButton } from '../../appNavigation/PushButton'
import { withStyles } from '../../../lib/styles'
import useClaimQueue from '../../dashboard/Claim/useClaimQueue'

const ClaimButton = ({ screenProps, styles }) => {
  const { queueStatus, handleClaim } = useClaimQueue()
  const isPending = queueStatus && queueStatus.status === 'pending'
  const canContinue = () => {
    //if there's no status the first time then get it
    //otherwise just return true.
    //in case we already have status then button is disabled if pending so its ok to return true here.
    if (queueStatus === undefined) {
      return handleClaim()
    }
    return true
  }

  return (
    <PushButton
      disabled={isPending}
      canContinue={canContinue}
      routeName="Claim"
      testID="claim_button"
      screenProps={screenProps}
      style={[styles.claimButton, isPending ? styles.inQueue : undefined]}
    >
      {isPending ? 'Queue' : 'Claim'}
    </PushButton>
  )
}

const getStylesFromProps = ({ theme }) => ({
  inQueue: {
    backgroundColor: theme.colors.orange,
  },
  claimButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.green,
    borderColor: theme.colors.surface,
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
