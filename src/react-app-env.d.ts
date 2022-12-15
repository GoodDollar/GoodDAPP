/// <reference types="react-scripts" />

declare module 'react-tradingview-widget'

declare module 'jazzicon' {
    export default function (diameter: number, seed: number): HTMLElement
}

declare module 'fortmatic'

interface RequestArguments {
    method: string
    params?: unknown[] | object
}

interface Window {
    walletLinkExtension?: any
    BinanceChain?: any
    eth?: object
    ethereum?: {
        isMetaMask?: boolean
        on?: (...args: any[]) => void
        off?: (...args: any[]) => void
        removeListener?: (...args: any[]) => void
        removeAllListeners?: (...args: any[]) => void
        autoRefreshOnNetworkChange?: boolean
        request?: (args: RequestArguments) => Promise<unknown>
        providers?: array
        selectedProvider: {
            isMetaMask?: boolean
            on?: (...args: any[]) => void
            off?: (...args: any[]) => void
            removeListener?: (...args: any[]) => void
            removeAllListeners?: (...args: any[]) => void
            autoRefreshOnNetworkChange?: boolean
            request?: (args: RequestArguments) => Promise<unknown>
        } | null
    }
    web3?: object
}

declare module 'content-hash' {
    declare function decode(x: string): string
    declare function getCodec(x: string): string
}

declare module 'multihashes' {
    declare function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array }
    declare function toB58String(hash: Uint8Array): string
}

type ArrayType<T> = T extends ArrayLike<infer I> ? I : never
