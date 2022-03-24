import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected, walletlink, onboard } from '../connectors'
import useMetaMask from '../hooks/useMetaMask'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useWallets } from '@web3-onboard/react'
import { NetworkContextName } from '../constants'
import { network } from '../connectors'

/**
 * 
 * @deprecated in favor of useOnboardConnect 'hooks/useActiveOnboard'
 */
export function useEagerConnect() {
    // const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
    const [tried, setTried] = useState(false)

    const { ethereum } = window

    // const isCoinbase = window.walletLinkExtension

    // useEffect(() => {
    //     injected.isAuthorized().then(isAuthorized => {
    //       if (isAuthorized) {
    //           activate(injected, undefined, true)
    //             .catch(() => {
    //                 setTried(true)
    //             })
    //             // if (window.ethereum?.removeAllListeners){
    //             //   window?.ethereum?.removeAllListeners(['networkChanged'])
    //             // }
    //       } else {
    //           if (isMobile && ethereum) {
    //               activate(injected, undefined, true).catch(() => {
    //                   setTried(true)
    //               })
    //           //     if (window.ethereum?.removeAllListeners){
    //           //       window?.ethereum?.removeAllListeners(['networkChanged'])
    //           //     }
    //           // } else if (isCoinbase && isCoinbase._addresses.length > 0){
    //           //     activate(walletlink, undefined, true).catch(() => {
    //           //       setTried(true)
    //           //     })
    //           } else {
    //             setTried(true)
    //           }
    //       }
    //     })
    // }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

    // // if the connection worked, wait until we get confirmation of that to flip the flag
    // useEffect(() => {
    //     if (active) {
    //       setTried(true)
    //     }
    // }, [active])

    return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { activate, deactivate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does
  const { active } = useActiveWeb3React()
  const metaMaskInfo = useMetaMask()
  const { ethereum } = window
  // const [primaryLabel] = onboard.state.get().wallets
  // const connectedWallets = useWallets()
    useEffect(() => {
        if (ethereum && !active && !suppress) {
          // todo: add activators for coinbase
            // const handleChainChanged = () => {
            //   console.log('chainChanged!')
            //   const onboardState = onboard.state.get().wallets
            //   console.log('onboard handleChainChanged -->', onboardState)
            //     // eat errors
            //     // activate(injected, undefined, true).catch(error => {
            //     //     console.error('Failed to activate after chain changed', error)
            //     // })
            //     // .then(() => window.location.reload()) // suggested by MetaMask Docs
            // } 

            const handleAccountsChanged = async(accounts: string[]) => {
              console.log('account changed!')
                if (accounts.length > 0) {
                    // eat errors
                    // activate(injected, undefined, true).catch(error => {
                    //     console.error('Failed to activate after accounts changed', error)
                    // })
                } else {
                  
                  // activate(network) 


                  if (metaMaskInfo.isMultiple) {
                    window.location.reload()
                  }
                }
            }

            if (metaMaskInfo.isMultiple && ethereum.selectedProvider?.on) {
              // ethereum.selectedProvider.on('chainChanged', handleChainChanged) 
              ethereum.selectedProvider.on('accountsChanged', handleAccountsChanged)  
            } else if (ethereum.on){
              // ethereum.on('chainChanged', handleChainChanged)
              ethereum.on('accountsChanged', handleAccountsChanged)
            }


            return () => { 
                if (metaMaskInfo.isMultiple && ethereum.selectedProvider?.off){
                  // ethereum.selectedProvider.off('chainChanged', handleChainChanged)
                  ethereum.selectedProvider.off('accountsChanged', handleAccountsChanged)
                } else if (ethereum.off) {
                  // ethereum.off('chainChanged', handleChainChanged)
                  ethereum.off('accountsChanged', handleAccountsChanged)
                }
            }
        } 
        return undefined
    }, [active, suppress, activate, deactivate, ethereum])
}

export { default as useFuse } from './useFuse'
export { default as useSortableData } from './useSortableData'
export { default as useUSDCPrice } from './useUSDCPrice'
