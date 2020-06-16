import React from 'react'

import Section from '../../common/layout/Section'
import ClaimButton from '../ClaimButton'
import useOnPress from '../../../lib/hooks/useOnPress'

const ButtonBlock = ({
  styles,
  entitlement,
  isCitizen,
  nextClaim,
  handleClaim,
  handleNonCitizen,
  isInQueue,
  ...props
}) => {
  const onPress = useOnPress(() => {
    if (!isCitizen) {
      handleNonCitizen()
      return
    }
      if (entitlement) {
        handleClaim()
      }
    },
    [entitlement, isCitizen, handleNonCitizen, handleClaim]
  )

  return (
    <Section.Stack style={styles.claimButtonContainer}>
      <ClaimButton
        isInQueue={isInQueue}
        isCitizen={isCitizen}
        entitlement={entitlement}
        nextClaim={nextClaim}
        onPress={onPress}
        {...props}
      />
    </Section.Stack>
  )
}

export default ButtonBlock
