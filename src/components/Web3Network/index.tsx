import React from 'react'
import { darken } from 'polished'
import { Activity } from 'react-feather'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useNetworkModalToggle } from '../../state/application/hooks'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import NetworkModal from '../NetworkModal'
import { ButtonOutlined } from '../gd/Button'
import styled from 'styled-components'
import { ButtonSecondary } from '../ButtonLegacy'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'
import { ChainId } from '@sushiswap/sdk'

const Web3StatusGeneric = styled(ButtonSecondary)`
    ${({ theme }) => theme.flexRowNoWrap}
    width: 100%;
    align-items: center;
    padding: 0.5rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    cursor: pointer;
    user-select: none;
    :focus {
        outline: none;
    }
`

const Web3StatusError = styled(Web3StatusGeneric)`
    background-color: ${({ theme }) => theme.red1};
    border: 1px solid ${({ theme }) => theme.red1};
    color: ${({ theme }) => theme.white};
    font-weight: 500;
    :hover,
    :focus {
        background-color: ${({ theme }) => darken(0.1, theme.red1)};
    }
`

const NetworkIcon = styled(Activity)`
    margin-left: 0.25rem;
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
`

const Text = styled.p`
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 0.5rem 0 0.25rem;
    font-size: 1rem;
    width: fit-content;
    font-weight: 500;
`

function Web3Network(): JSX.Element | null {
    const { chainId, error } = useActiveWeb3React()
    const { i18n } = useLingui()
    const sendData = useSendAnalyticsData()

    const toggleNetworkModal = useNetworkModalToggle()

    const onNetworkChange = () => {
        toggleNetworkModal()
        sendData({ event: 'network_switch', action: 'network_switch_start', network: ChainId[chainId] })
    }

    if (!chainId) return null

    return (
        <>
            {error ? (
                <Web3StatusError onClick={onNetworkChange}>
                    <NetworkIcon />
                    <Text>{i18n._(t`Unsupported network`)}</Text>
                </Web3StatusError>
            ) : (
                <div
                    className="flex items-center rounded p-0.5 whitespace-nowrap   cursor-pointer select-none pointer-events-auto"
                    onClick={() => toggleNetworkModal()}
                >
                    <ButtonOutlined style={{ padding: '0' }}>
                        <div className="grid items-center grid-flow-col px-3 py-2 rounded-lg pointer-events-auto auto-cols-max">
                            <img
                                src={NETWORK_ICON[chainId]}
                                alt="Switch Network"
                                className="mr-2 rounded-md"
                                style={{ width: 22, height: 22 }}
                            />
                            <div className="">{NETWORK_LABEL[chainId]}</div>
                        </div>
                    </ButtonOutlined>
                </div>
            )}
            <NetworkModal />
        </>
    )
}

export default Web3Network
