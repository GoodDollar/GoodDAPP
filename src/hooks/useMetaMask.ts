export type MetaMaskInfo = {
    isMetaMask: boolean
    isMultiple: boolean
}

/**
 * checks for multiple providers and if one of those is metamask
 * @returns {isMetaMask, isMultiple}
 */

export default function useMetaMask(): MetaMaskInfo {
    const { ethereum } = window
    const isMultiple = ethereum && ethereum.providers?.length > 1

    const isMetaMask = ethereum && (isMultiple ? ethereum.selectedProvider?.isMetaMask : ethereum.isMetaMask)
    return {
        isMetaMask: isMetaMask ?? false,
        isMultiple: isMultiple ?? false,
    }
}
