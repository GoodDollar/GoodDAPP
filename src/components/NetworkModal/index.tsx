import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { useModalOpen, useNetworkModalToggle } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/types'
import { ChainId } from '@sushiswap/sdk'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import React, { useMemo } from 'react'
import Option from '../WalletModal/Option'
import styled from 'styled-components'
import { AdditionalChainId } from '../../constants'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const PARAMS: {
    [chainId in ChainId | AdditionalChainId]?: {
        chainId: string
        chainName: string
        nativeCurrency: {
            name: string
            symbol: string
            decimals: number
        }
        rpcUrls: string[]
        blockExplorerUrls: string[]
    }
} = {
    [ChainId.MAINNET]: {
        chainId: '0x1',
        chainName: 'Ethereum',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.infura.io/v3'],
        blockExplorerUrls: ['https://etherscan.com']
    },
    [ChainId.FANTOM]: {
        chainId: '0xfa',
        chainName: 'Fantom',
        nativeCurrency: {
            name: 'Fantom',
            symbol: 'FTM',
            decimals: 18
        },
        rpcUrls: ['https://rpcapi.fantom.network'],
        blockExplorerUrls: ['https://ftmscan.com']
    },
    [ChainId.BSC]: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
    },
    [ChainId.MATIC]: {
        chainId: '0x89',
        chainName: 'Matic',
        nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: [
            //'https://matic-mainnet.chainstacklabs.com/'
            'https://rpc-mainnet.maticvigil.com'
        ],
        blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com']
    },
    [ChainId.HECO]: {
        chainId: '0x80',
        chainName: 'Heco',
        nativeCurrency: {
            name: 'Heco Token',
            symbol: 'HT',
            decimals: 18
        },
        rpcUrls: ['https://http-mainnet.hecochain.com'],
        blockExplorerUrls: ['https://hecoinfo.com']
    },
    [ChainId.XDAI]: {
        chainId: '0x64',
        chainName: 'xDai',
        nativeCurrency: {
            name: 'xDai Token',
            symbol: 'xDai',
            decimals: 18
        },
        rpcUrls: ['https://rpc.xdaichain.com'],
        blockExplorerUrls: ['https://blockscout.com/poa/xdai']
    },
    [ChainId.HARMONY]: {
        chainId: '0x63564C40',
        chainName: 'Harmony One',
        nativeCurrency: {
            name: 'One Token',
            symbol: 'ONE',
            decimals: 18
        },
        rpcUrls: ['https://api.s0.t.hmny.io'],
        blockExplorerUrls: ['https://explorer.harmony.one/']
    },
    [ChainId.AVALANCHE]: {
        chainId: '0xA86A',
        chainName: 'Avalanche',
        nativeCurrency: {
            name: 'Avalanche Token',
            symbol: 'AVAX',
            decimals: 18
        },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://explorer.avax.network']
    },
    [ChainId.OKEX]: {
        chainId: '0x42',
        chainName: 'OKEx',
        nativeCurrency: {
            name: 'OKEx Token',
            symbol: 'OKT',
            decimals: 18
        },
        rpcUrls: ['https://exchainrpc.okex.org'],
        blockExplorerUrls: ['https://www.oklink.com/okexchain']
    },
    [AdditionalChainId.FUSE]: {
        chainId: '0x7a',
        chainName: 'Fuse',
        nativeCurrency: {
            name: 'FUSE Token',
            symbol: 'FUSE',
            decimals: 18
        },
        rpcUrls: ['https://rpc.fuse.io'],
        blockExplorerUrls: ['https://explorer.fuse.io']
    }
}

const TextWrapper = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: ${({ theme }) => theme.color.text1};

    .site {
        font-weight: 700;
        color: ${({ theme }) => theme.color.text2};
    }

    .network {
        font-weight: 700;
        color: ${({ theme }) => theme.color.switch};
    }
`

export default function NetworkModal(): JSX.Element | null {
    const { i18n } = useLingui()
    const { account, chainId, error } = useWeb3React()
    const { library } = useActiveWeb3React()
    const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
    const toggleNetworkModal = useNetworkModalToggle()

    const { ethereum } = window
    const networkLabel: string | null = (NETWORK_LABEL as any)[chainId || (ethereum as any)?.networkVersion] || null
    const network = process.env.NETWORK || 'staging'

    const allowedNetworks = useMemo(() => {
        switch (true) {
            case network === 'production' && !error:
                return [ChainId.MAINNET, AdditionalChainId.FUSE]

            case network === 'production' && error instanceof UnsupportedChainIdError:
                return [ChainId.MAINNET]

            case network === 'staging' && !error:
                return [ChainId.KOVAN, AdditionalChainId.FUSE, ChainId.ROPSTEN]

            case network === 'staging' && error instanceof UnsupportedChainIdError:
                return [ChainId.KOVAN, ChainId.ROPSTEN]

            default:
                return [ChainId.KOVAN, AdditionalChainId.FUSE, ChainId.ROPSTEN, ChainId.MAINNET]
        }
    }, [error, network])

    const isMetaMask = window.ethereum && window.ethereum.isMetaMask

    return (
        <Modal isOpen={networkModalOpen} onDismiss={toggleNetworkModal}>
            <ModalHeader className="mb-1" onClose={toggleNetworkModal} title="Select network" />
            <TextWrapper>
                {i18n._(t`You are currently browsing`)} <span className="site">GOOD DOLLAR</span>
                <br />{' '}
                {networkLabel && (
                    <>
                        {i18n._(t`on the`)} <span className="network">{networkLabel}</span> {i18n._(t`network`)}
                    </>
                )}
            </TextWrapper>

            <div className="flex flex-col space-y-5 overflow-y-auto mt-3">
                {allowedNetworks.map((key: ChainId | AdditionalChainId) => {
                    return (
                        <Option
                            clickable={chainId !== key}
                            active={chainId === key}
                            header={NETWORK_LABEL[key]}
                            subheader={null}
                            icon={NETWORK_ICON[key]}
                            id={String(key)}
                            key={key}
                            onClick={() => {
                                toggleNetworkModal()
                                const params = PARAMS[key]
                                if (
                                    [
                                        ChainId.MAINNET,
                                        ChainId.KOVAN,
                                        ChainId.RINKEBY,
                                        ChainId.GÖRLI,
                                        ChainId.ROPSTEN
                                    ].includes(key as any)
                                ) {
                                    console.log(key.toString(16))
                                    if (isMetaMask) {
                                        ;(ethereum as any).request({
                                            method: 'wallet_switchEthereumChain',
                                            params: [{ chainId: `0x${key.toString(16)}` }]
                                        })
                                    } else {
                                        library?.send('wallet_switchEthereumChain', [
                                            { chainId: `0x${key.toString(16)}` }
                                        ])
                                    }
                                } else {
                                    if (isMetaMask) {
                                        ;(ethereum as any).request({
                                            method: 'wallet_addEthereumChain',
                                            params: [params, account]
                                        })
                                    } else {
                                        library?.send('wallet_addEthereumChain', [params, account])
                                    }
                                }
                            }}
                        />
                    )
                })}
            </div>
        </Modal>
    )
}
