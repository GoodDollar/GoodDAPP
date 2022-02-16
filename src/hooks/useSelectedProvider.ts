// export {}
import React, { useEffect } from 'react'

/*
* Used when multiple providers exists on the ethereum object
* and place the selected/active provider as selectedProvider
*/
export default function useSelectedProvider():Boolean | undefined {
  const { ethereum } = window
  const isMultiple = ethereum && ethereum.providers?.length > 1
  useEffect(() => {
    let provider:any 
    if (window.ethereum && isMultiple && !ethereum.selectedProvider) {
      // console.log('selecting provider . . . ') 
      provider = ethereum.providers.find((provider: any) => provider.isMetaMask)
      window.ethereum.selectedProvider = provider
    }
  }, [ethereum, isMultiple])
  return isMultiple
}



