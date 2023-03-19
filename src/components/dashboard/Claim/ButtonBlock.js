import React, { useCallback } from 'react'

import Section from '../../common/layout/Section'
import ClaimButton from '../ClaimButton'

const ButtonBlock = ({ styles, entitlement, isCitizen, nextClaim, handleClaim, handleNonCitizen, ...props }) => {
  const onPress = useCallback(() => {
    if (!isCitizen) {
      return handleNonCitizen()
    }
    if (entitlement) {
      return handleClaim()
    }
  }, [entitlement, isCitizen, handleNonCitizen, handleClaim])

  return (
    <Section.Stack style={styles?.claimButtonContainer}>
      <ClaimButton isCitizen={isCitizen} entitlement={entitlement} nextClaim={nextClaim} onPress={onPress} {...props} />
    </Section.Stack>
  )
}

export default ButtonBlock
