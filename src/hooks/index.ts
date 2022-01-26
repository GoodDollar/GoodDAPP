import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected } from '../connectors'

export function useEagerConnect() {
    const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
    const [tried, setTried] = useState(false)

    useEffect(() => {
        injected.isAuthorized().then(isAuthorized => {
            if (isAuthorized) {
                activate(injected, undefined, true).catch(() => {
                    setTried(true)
                })
            } else {
                if (isMobile && window.ethereum) {
                    activate(injected, undefined, true).catch(() => {
                        setTried(true)
                    })
                } else {
                    setTried(true)
                }
            }
        })
    }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

    // if the connection worked, wait until we get confirmation of that to flip the flag
    useEffect(() => {
        if (active) {
            setTried(true)
        }
    }, [active])

    return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
    const { active, error, activate, deactivate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

    useEffect(() => {
        const { ethereum } = window

        if (window.ethereum) {
          let provider:any
          const isMultiple = window.ethereum?.providers?.length > 1
          !isMultiple ?  provider = ethereum : 
                         provider = window.ethereum?.providers.find((isMetaMask: any) => isMetaMask.isMetaMask) 
          window.ethereum.selectedProvider = provider  
        }

        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleChainChanged = () => {
                // eat errors
                activate(injected, undefined, true)
                // .then(() => window.location.reload()) // suggested by MetaMask Docs
                .catch(error => {
                    console.error('Failed to activate after chain changed', error)
                })
            }

            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    // eat errors
                    activate(injected, undefined, true).catch(error => {
                        console.error('Failed to activate after accounts changed', error)
                    })
                } else {
                  deactivate() 
                }
            }
            
            ethereum.selectedProvider.on('chainChanged', handleChainChanged) 
            ethereum.selectedProvider.on('accountsChanged', handleAccountsChanged)


            return () => {
              // Not sure why, but the actual listener exists here
              // .on has to be set through the selectedProvider to work??
                if (ethereum.removeListener) {
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                }
            }
        }
        return undefined
    }, [active, error, suppress, activate, deactivate])
}

export { default as useFuse } from './useFuse'
export { default as useSortableData } from './useSortableData'
export { default as useUSDCPrice } from './useUSDCPrice'
