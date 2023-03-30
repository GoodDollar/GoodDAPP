import { useContext, useEffect } from 'react'
import useEnrollmentIdentifier from '../../hooks/useEnrollmentIdentifier'
import { FVFlowContext } from '../context/FVFlowContext'

const useFVLoginInfoCheck = navigation => {
  const { isFVFlow, fvFlowError } = useContext(FVFlowContext)
  const [enrollmentIdentifier] = useEnrollmentIdentifier()
  const { navigate } = navigation

  useEffect(() => {
    if (!isFVFlow || !navigate) {
      return
    }

    if (fvFlowError || !enrollmentIdentifier) {
      navigate('FVFlowError')
    }
  }, [isFVFlow, enrollmentIdentifier, fvFlowError, navigate])
}

export default useFVLoginInfoCheck
