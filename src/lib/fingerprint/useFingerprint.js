import { useCallback, useEffect, useState } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
import Config from '../../config/config'

let fpPromise

export const useFingerprint = () => {
  const [fp, setFP] = useState()
  const { fpSiteKey } = Config
  useEffect(() => {
    if (!fpPromise) {
      fpPromise = fpSiteKey && FingerprintJS.load({ apiKey: fpSiteKey })
    }
    setFP(fpPromise)
  }, [])

  const getFingerprintId = useCallback(() => {
    return fp && fp.then(fp => fp.get())
  }, [fp])

  return { ready: !!fp, getFingerprintId }
}
