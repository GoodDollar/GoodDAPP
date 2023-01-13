/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { StaticJsonRpcProvider as StaticJsonRpcProviderType } from '@ethersproject/providers'
import { AsyncStorage } from '@gooddollar/web3sdk-v2'
import { IWalletConnectOptions } from '@walletconnect/types'
import { isMobile } from './helpers/isMobile'

import type { Chain, EIP1193Provider, ProviderAccounts, WalletInit } from '@web3-onboard/common'

interface ZengoConnectOptions {
    bridge?: string
    qrcodeModalOptions?: {
        desktopLinks: string[]
        mobileLinks: string[]
    }
    connectFirstChainId?: boolean
}

function zenGoModule(options?: ZengoConnectOptions): WalletInit {
    const { bridge = 'https://bridge.walletconnect.org', qrcodeModalOptions, connectFirstChainId } = options || {}

    return () => {
        return {
            label: 'ZenGo',
            getIcon: async () => (await import('./helpers/icon.js')).default,
            getInterface: async ({ chains, EventEmitter }: { chains: Chain[]; EventEmitter: any }) => {
                const { StaticJsonRpcProvider } = await import('@ethersproject/providers')

                const { ProviderRpcError, ProviderRpcErrorCode } = await import('@web3-onboard/common')

                const { default: WalletConnect } = await import('@walletconnect/client')

                // @ts-ignore - It thinks it is missing properties since it expect it to be nested under default
                let QRCodeModal: typeof import('@walletconnect/qrcode-modal').default = await import(
                    '@walletconnect/qrcode-modal'
                )

                // @ts-ignore - TS thinks that there is no default property on the `QRCodeModal` but sometimes there is
                QRCodeModal = QRCodeModal.default || QRCodeModal

                let wcOptions: IWalletConnectOptions = { bridge }
                if (!isMobile()) {
                    wcOptions = {
                        ...wcOptions,
                        qrcodeModalOptions: { desktopLinks: ['ZenGo'] }, // Todo: doesn't show up
                    }
                }

                const { Subject, fromEvent } = await import('rxjs')
                const { takeUntil, take } = await import('rxjs/operators')

                const connector = new WalletConnect(wcOptions)

                const emitter = new EventEmitter()

                class EthProvider {
                    public request: EIP1193Provider['request']
                    public connector: InstanceType<typeof WalletConnect>
                    public chains: Chain[]
                    public disconnect: EIP1193Provider['disconnect']
                    public emit: (typeof EventEmitter)['emit']
                    public on: (typeof EventEmitter)['on']
                    public removeListener: (typeof EventEmitter)['removeListener']

                    private disconnected$: InstanceType<typeof Subject>
                    private providers: Record<string, StaticJsonRpcProviderType>

                    constructor({
                        connector,
                        chains,
                    }: {
                        connector: InstanceType<typeof WalletConnect>
                        chains: Chain[]
                    }) {
                        this.emit = emitter.emit.bind(emitter)
                        this.on = emitter.on.bind(emitter)
                        this.removeListener = emitter.removeListener.bind(emitter)

                        this.connector = connector
                        this.chains = chains
                        this.disconnected$ = new Subject()
                        this.providers = {}

                        // listen for session updates
                        fromEvent(this.connector, 'session_update', (error, payload) => {
                            if (error) {
                                throw error
                            }

                            return payload
                        })
                            .pipe(takeUntil(this.disconnected$))
                            .subscribe({
                                next: ({ params }) => {
                                    const [{ accounts, chainId }] = params
                                    this.emit('accountsChanged', accounts)
                                    this.emit('chainChanged', `0x${chainId.toString(16)}`)
                                },
                                error: console.warn,
                            })

                        // listen for disconnect event
                        fromEvent(this.connector, 'disconnect', (error, payload) => {
                            if (error) {
                                throw error
                            }

                            return payload
                        })
                            .pipe(takeUntil(this.disconnected$))
                            .subscribe({
                                next: () => {
                                    this.emit('accountsChanged', [])
                                    this.disconnected$.next(true)
                                    AsyncStorage.safeRemove('walletconnect')
                                },
                                error: console.warn,
                            })

                        this.disconnect = () => this.connector.killSession()

                        this.request = async ({ method, params }: { method: string; params?: any }) => {
                            if (method === 'eth_chainId') {
                                return `0x${this.connector.chainId.toString(16)}`
                            }

                            if (method === 'eth_requestAccounts') {
                                return new Promise<ProviderAccounts>((resolve, reject) => {
                                    // Check if connection is already established
                                    if (!this.connector.connected) {
                                        // create new session
                                        void this.connector
                                            .createSession(
                                                connectFirstChainId
                                                    ? { chainId: parseInt(chains[0].id, 16) }
                                                    : undefined
                                            )
                                            .then(() => {
                                                if (isMobile()) {
                                                    window.open(
                                                        `https://get.zengo.com/wc?uri=${encodeURIComponent(
                                                            this.connector.uri
                                                        )}`,
                                                        '_blank'
                                                    )
                                                } else {
                                                    QRCodeModal.open(
                                                        this.connector.uri,
                                                        () =>
                                                            reject(
                                                                new ProviderRpcError({
                                                                    code: 4001,
                                                                    message: 'User rejected the request.',
                                                                })
                                                            ),
                                                        qrcodeModalOptions
                                                    )
                                                }
                                            })
                                    } else {
                                        const { accounts, chainId } = this.connector.session
                                        this.emit('chainChanged', `0x${chainId.toString(16)}`)
                                        return resolve(accounts)
                                    }

                                    // Subscribe to connection events
                                    fromEvent(this.connector, 'connect', (error, payload) => {
                                        if (error) {
                                            throw error
                                        }

                                        return payload
                                    })
                                        .pipe(take(1))
                                        .subscribe({
                                            next: ({ params }) => {
                                                const [{ accounts, chainId }] = params
                                                this.emit('accountsChanged', accounts)
                                                this.emit('chainChanged', `0x${chainId.toString(16)}`)
                                                QRCodeModal.close()
                                                resolve(accounts)
                                            },
                                            error: reject,
                                        })
                                })
                            }

                            if (method === 'wallet_switchEthereumChain' || method === 'eth_selectAccounts') {
                                throw new ProviderRpcError({
                                    code: ProviderRpcErrorCode.UNSUPPORTED_METHOD,
                                    message: `The Provider does not support the requested method: ${method}`,
                                })
                            }

                            if (method === 'eth_sendTransaction') {
                                return this.connector.sendTransaction(params[0])
                            }

                            if (method === 'eth_signTransaction') {
                                return this.connector.signTransaction(params[0])
                            }

                            if (method === 'personal_sign') {
                                return this.connector.signPersonalMessage(params)
                            }

                            if (method === 'eth_sign') {
                                return this.connector.signMessage(params)
                            }

                            if (method === 'eth_signTypedData') {
                                return this.connector.signTypedData(params)
                            }

                            if (method === 'eth_accounts') {
                                return this.connector.sendCustomRequest({
                                    id: 1337,
                                    jsonrpc: '2.0',
                                    method,
                                    params,
                                })
                            }

                            const chainId = await this.request({ method: 'eth_chainId' })

                            if (!this.providers[chainId]) {
                                const currentChain = chains.find(({ id }) => id === chainId)

                                if (!currentChain) {
                                    throw new ProviderRpcError({
                                        code: ProviderRpcErrorCode.CHAIN_NOT_ADDED,
                                        message: `The Provider does not have a rpcUrl to make a request for the requested method: ${method}`,
                                    })
                                }

                                this.providers[chainId] = new StaticJsonRpcProvider(currentChain.rpcUrl)
                            }

                            return this.providers[chainId].send(method, params)
                        }
                    }
                }

                return {
                    provider: new EthProvider({ chains, connector }),
                }
            },
        }
    }
}

export default zenGoModule
