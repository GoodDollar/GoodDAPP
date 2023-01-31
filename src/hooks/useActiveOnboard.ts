/* eslint-disable @typescript-eslint/no-unused-vars */
import { Web3Provider } from '@ethersproject/providers'
import { AsyncStorage, useAppRestart } from '@gooddollar/web3sdk-v2'
import { ChainId } from '@sushiswap/sdk'
import { EIP1193Provider } from '@web3-onboard/common'
import { WalletState } from '@web3-onboard/core'
import type { Account } from '@web3-onboard/core/dist/types'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { isEmpty, noop } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import web3Utils from 'web3-utils'
import usePromise from './usePromise'

import { SupportedChainId, UnsupportedChainId } from '@gooddollar/web3sdk'

import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'

export type IsSupportedChainId = {
    isSupported: boolean
    chainId: string
}

type OnboardConnectProps = {
    activated: boolean
    tried: boolean
}

export const WalletLabels: Readonly<string[]> = ['WalletConnect', 'ZenGo', 'Coinbase Wallet']
export const WalletLinkKeys: Readonly<string[]> = [
    '-walletlink:https://www.walletlink.org:Addresses',
    '-walletlink:https://www.walletlink.org:session:secret',
    '-walletlink:https://www.walletlink.org:session:id',
]

export type ActiveOnboard<T = any> = Omit<
    Web3ReactContextInterface<Web3Provider>,
    'activate' | 'deactivate' | 'setError' | 'connector'
>

export interface ISelectedProvider {
    isMetaMask: boolean
    on(...args: any[]): void
    off(...args: any[]): void
    removeListener(...args: any[]): void
    removeAllListeners(...args: any[]): void
    autoRefreshOnNetworkChange: boolean
    request(args: { method: string; params?: unknown[] | object }): Promise<unknown>
}

export interface EIP1193ProviderExtended extends EIP1193Provider {
    providers?: any
    isMetamask?: boolean
    selectedProvider?: Partial<ISelectedProvider>
}

export interface ActiveOnboardInterface<T = any> extends ActiveOnboard<Web3Provider> {
    active: boolean
    accounts?: Account[]
    eipProvider?: EIP1193ProviderExtended
    chainId: ChainId
    chainIdHex?: string
    account?: string
    label?: string
    error?: Error | undefined
}

export function IsSupportedChain(chainIdHex: string): IsSupportedChainId {
    const chainId = parseInt(chainIdHex)
    const isSupported = Object.values(SupportedChainId).includes(chainId)
    const supportedChainHex = isSupported ? chainIdHex : '0xa4ec'
    return { isSupported: isSupported, chainId: supportedChainHex }
}

export function onboardContext(wstate: WalletState[]): ActiveOnboardInterface {
    const [{ provider, label, accounts, chains }] = wstate
    const web3provider = new Web3Provider(provider)
    const chainIdHex = chains[0].id
    const { isSupported, chainId } = IsSupportedChain(chainIdHex)
    const error = !isSupported ? new UnsupportedChainId(chainIdHex) : undefined

    return {
        active: true,
        accounts: accounts,
        chainId: parseInt(chainId),
        account: web3Utils.toChecksumAddress(accounts[0]?.address),
        label: label,
        eipProvider: provider as EIP1193ProviderExtended,
        library: web3provider,
        error: error,
    }
}

export function useActiveOnboard<T = any>(): ActiveOnboardInterface<T> {
    const connectedWallets = useWallets()
    const context = useMemo<ActiveOnboardInterface<Web3Provider>>(() => {
        if (connectedWallets.length > 0) {
            return onboardContext(connectedWallets)
        } else {
            return { active: false, chainId: 1 }
        }
    }, [connectedWallets])

    return context
}

/** Store connected wallet data in localStorage to be used for eagerly connecting on page-load
 * @param wallets all currently connected wallets
 * @param activeChainId active chain id is the currently connected chain if supported, else it defaults to mainnet
 * @returns void
 */
export function StoreOnboardState(wallets: WalletState[], activeChainId: string | undefined): void {
    if (isEmpty(wallets)) {
        void AsyncStorage.removeItem('currentConnectWallet')
        return
    }

    const walletLabel = wallets.map(({ label }) => label)
    const connectedAccount = wallets.map(({ accounts }) => accounts[0])
    const connectedChain = activeChainId
    const connected = [
        {
            accounts: connectedAccount,
            chains: connectedChain,
            label: walletLabel,
        },
    ]

    AsyncStorage.safeSet('currentConnectWallet', connected)
}

// TODO: Seperate current connected wallet && ALL connected wallets
// TODO: Handle multiple accounts connected
/**
 * Used for eagerly connecting on page-load when a previous wallet connection exists
 * while also keeping track of any state updates (disconnect / switching chains)
 * @returns tried & activated
 */
export function useOnboardConnect(): OnboardConnectProps {
    const [tried, setTried] = useState<boolean>(false)
    const [activated, setActivated] = useState<boolean>(false)
    const [, connect] = useConnectWallet()
    const [{ connectedChain }, setChain] = useSetChain()
    const connectedWallets = useWallets()
    const restartApp = useAppRestart()

    const [previouslyConnected, loading]: readonly [any, boolean, any, any] = usePromise(
        async () => AsyncStorage.getItem('currentConnectWallet').then((value: any): any => value ?? {}),
        []
    )

    const updateStorage = (newChainId: string, currentWallet: WalletState[]) => {
        const { chainId } = IsSupportedChain(newChainId)
        void setChain({ chainId: chainId })
        StoreOnboardState(currentWallet, chainId)
        setActivated(true)
    }

    const connectOnboard = async () => {
        // Coinbase reloads instead of sending accountsChanged event, so empty storage if no active address can be found
        if (previouslyConnected[0].label[0] === 'Coinbase Wallet') {
            const isStillActive = await AsyncStorage.getItem('-walletlink:https://www.walletlink.org:Addresses')

            if (!isStillActive) {
                AsyncStorage.safeRemove('currentConnectWallet')
                setTried(true)
                return
            }
        }
        // disableModals:true for silently connecting
        await connect({ autoSelect: { label: previouslyConnected[0].label[0], disableModals: true } })
        setActivated(true)
    }

    // eager connect
    useEffect(() => {
        // ignore effect until usePromise loaded
        if (loading) {
            return
        }

        if (previouslyConnected.length && !tried) {
            void connectOnboard()
            setTried(true)
        } else if (activated || !previouslyConnected[0]) {
            setTried(true)
        }
    }, [activated, tried, connect, previouslyConnected, loading])

    useEffect(() => {
        const isConnected = connectedWallets.length > 0

        // ignore effect until usePromise loaded
        if (loading) {
            return
        }

        if (isConnected && connectedChain) {
            updateStorage(connectedChain.id, connectedWallets)
        }

        // disconnect
        if (!isConnected && previouslyConnected.length && (tried || activated)) {
            const toReload = WalletLabels.includes(previouslyConnected[0].label[0])

            StoreOnboardState(connectedWallets, '0x1')
            setActivated(false)

            if (!activated) {
                return
            }

            const promises = []
            const cleanup = async (key: string) => AsyncStorage.removeItem(key).catch(noop)

            if (previouslyConnected[0].label[0] === 'Coinbase Wallet') {
                promises.push(...WalletLinkKeys.map(cleanup))
            }

            if (toReload) {
                promises.push(cleanup('walletconnect'))
            }

            if (isEmpty(promises)) {
                return
            }

            void Promise.all(promises).then(() => restartApp()) // temporarily necessary, as there is a irrecoverable error/bug when not reloading
        }
    }, [connectedWallets, tried, loading])

    return { tried, activated }
}
