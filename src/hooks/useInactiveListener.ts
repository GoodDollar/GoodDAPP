import { useEffect } from 'react'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { injected } from '../connectors'

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
function useInactiveListener(suppress = false) {
    const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

    useEffect(() => {
        const { ethereum } = window
        
        const isOnlyMeta = window.ethereum?.providers?.length === 1
        if (!isOnlyMeta) {
          const provider = window.ethereum?.providers.find((isMetaMask: any) => isMetaMask.isMetaMask)
          if (window.ethereum){
            window.ethereum.selectedProvider = provider
          }
        }

        if ((ethereum && ethereum.on) || (ethereum && ethereum.selectedProvider.on) && !active && !error && !suppress) {
            const handleChainChanged = () => {
                // eat errors
                activate(injected, undefined, true)
                // .then(() => window.location.reload())
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
                }
            }

            if (isOnlyMeta && ethereum.on){
              ethereum.on('chainChanged', handleChainChanged)
              ethereum.on('accountsChanged', handleAccountsChanged)
            } else {
              ethereum.selectedProvider.on('chainChanged', handleChainChanged)
              ethereum.selectedProvider.on('accountsChanged', handleAccountsChanged)
            }

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                }
            }
        }
        return undefined
    }, [active, error, suppress, activate])
}

export default useInactiveListener
