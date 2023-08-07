import { useContext, useEffect } from 'react'
import useEnrollmentIdentifier from '../../hooks/useEnrollmentIdentifier'
import { FVFlowContext } from '../context/FVFlowContext'

const useFVLoginInfoCheck = navigation => {
  const { isFVFlow, fvFlowError, isWebView } = useContext(FVFlowContext)
  const { faceIdentifier } = useEnrollmentIdentifier()
  const { navigate } = navigation

  useEffect(() => {
    if (!isFVFlow || !navigate) {
      return
    }

    if (isWebView || fvFlowError || !faceIdentifier) {
      navigate('FVFlowError')
    }
  }, [isFVFlow, faceIdentifier, fvFlowError, navigate])
}

export default useFVLoginInfoCheck
