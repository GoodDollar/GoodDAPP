import { isUndefined, negate, pickBy } from 'lodash'
import { useCallback, useContext } from 'react'
import { redirectTo } from '../../../../lib/utils/linking'
import { FVFlowContext } from '../context/FVFlowContext'

const useFVRedirect = () => {
  const { rdu, cbu } = useContext(FVFlowContext)

  const fvRedirect = useCallback(
    (verified, reason = undefined) => {
      const url = rdu || cbu
      const urlType = rdu ? 'rdu' : 'cbu'
      const payload = pickBy({ verified, reason }, negate(isUndefined))

      if (url) {
        redirectTo(url, urlType, payload)
      }
    },
    [rdu, cbu],
  )

  return fvRedirect
}

export default useFVRedirect
