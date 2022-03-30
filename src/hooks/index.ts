import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { onboard } from '../connectors'
import useMetaMask from '../hooks/useMetaMask'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { OnboardSubscribe } from '../components/BlockNativeOnboard'

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  // const { activate, deactivate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does
  const { active, eipProvider, library } = useActiveWeb3React()
  // const [ {chains, connectedChain, settingChain }, setChain] = useSetChain()
  const [ activated, setActivated] = useState(false)
  const metaMaskInfo = useMetaMask()
  // const {ethereum} = window // eipProvider used instead of ethereum as not all supported wallets use the ethereum namespace

  const [primaryWallet] = onboard.state.get().wallets
    useEffect(() => {
      if (active && eipProvider && !activated){

        const handleChainChanged = () => {
          // console.log("chainchanged")
          OnboardSubscribe()
        }

        const handleAccountsChanged = async(accounts: string[]) => {
          // console.log('accounts changed')
          // console.log('accounts changed accounts -->', {accounts})
            if (accounts.length > 0) {
              OnboardSubscribe()
            } else {
              await onboard.disconnectWallet({label: primaryWallet.label})
              if (metaMaskInfo.isMultiple || primaryWallet.label === 'WalletConnect') {
                window.location.reload()
              }
            }
        }

        // console.log({metaMaskInfo})
        if (metaMaskInfo.isMultiple && eipProvider.selectedProvider?.on){
          eipProvider.selectedProvider.on('chainChanged', handleChainChanged)
          eipProvider.selectedProvider.on('accountsChanged', handleAccountsChanged)
        } else {
          console.log('set listeners, no multiple')
          eipProvider.on('chainChanged', handleChainChanged)
          eipProvider.on('accountsChanged', handleAccountsChanged)
        }


        return () => {
          setActivated(true)
          if (metaMaskInfo.isMultiple && eipProvider.selectedProvider?.removeListener){
            eipProvider.selectedProvider.removeListener('chainChanged', handleChainChanged)
            eipProvider.selectedProvider.removeListener('accountsChanged', handleAccountsChanged)
          } else {
            eipProvider.removeListener('chainChanged', handleChainChanged)
            eipProvider.removeListener('accountsChanged', handleAccountsChanged)
          }
        }
      } 
      setActivated(false)
      return undefined
    }, [active, suppress, eipProvider])
}

export { default as useFuse } from './useFuse'
export { default as useSortableData } from './useSortableData'
export { default as useUSDCPrice } from './useUSDCPrice'
