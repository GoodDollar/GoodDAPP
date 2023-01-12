import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import { useModalOpen, useNetworkModalToggle } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/types'
import { ChainId } from '@sushiswap/sdk'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import React, { useCallback, useMemo } from 'react'
import Option from '../WalletModal/Option'
import styled from 'styled-components'
import { AdditionalChainId, ChainIdHex } from '../../constants'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useSetChain } from '@web3-onboard/react'

import { getNetworkEnv, UnsupportedChainId } from '@gooddollar/web3sdk'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'

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

const ChainOption = ({ chainId, chain, toggleNetworkModal, switchChain, labels, icons }: any) => {
    const onOptionClick = useCallback(() => {
        toggleNetworkModal()
        switchChain(chain)
    }, [switchChain, toggleNetworkModal, chain])

    return (
        <Option
            clickable={chainId !== chain}
            active={chainId === chain}
            header={labels[chain]}
            subheader={null}
            icon={icons[chain]}
            id={String(chain)}
            onClick={onOptionClick}
        />
    )
}

export default function NetworkModal(): JSX.Element | null {
    const { i18n } = useLingui()
    const { chainId, error } = useActiveWeb3React()
    const sendData = useSendAnalyticsData()

    const [, setChain] = useSetChain()
    const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
    const toggleNetworkModal = useNetworkModalToggle()

    const networkLabel: string | null = error ? null : (NETWORK_LABEL as any)[chainId]
    const network = getNetworkEnv()

    const allowedNetworks = useMemo(() => {
        switch (true) {
            case network === 'production' && !error:
                return [ChainId.MAINNET, AdditionalChainId.FUSE]

            case network === 'production' && error instanceof UnsupportedChainId:
                return [ChainId.MAINNET]

            case network === 'staging' && !error:
                return [AdditionalChainId.FUSE, AdditionalChainId.CELO]

            default:
                return [AdditionalChainId.FUSE, ChainId.MAINNET, AdditionalChainId.CELO]
        }
    }, [error, network])

    const switchChain = useCallback(
        async (chain: ChainId | AdditionalChainId) => {
            const chainId = [ChainId.MAINNET, ChainId.RINKEBY, ChainId.GÖRLI].includes(chain as any)
                ? `0x${chain.toString(16)}`
                : ChainIdHex[chain]

            const success = await setChain({ chainId })

            if (success) {
                sendData({
                    event: 'network_switch',
                    action: 'network_switch_success',
                    network: ChainId[chain],
                })
            }
        },
        [setChain]
    )

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

            <div className="flex flex-col mt-3 space-y-5 overflow-y-auto">
                {allowedNetworks.map((chain: ChainId | AdditionalChainId) => (
                    <ChainOption
                        key={chain}
                        chainId={chainId}
                        chain={chain}
                        labels={NETWORK_LABEL}
                        icons={NETWORK_ICON}
                        toggleNetworkModal={toggleNetworkModal}
                        switchChain={switchChain}
                    />
                ))}
            </div>
        </Modal>
    )
}
