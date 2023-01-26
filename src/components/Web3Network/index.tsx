import React from 'react'
import { darken } from 'polished'
import { Activity } from 'react-feather'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useNetworkModalToggle } from '../../state/application/hooks'
import { NETWORK_ICON, NETWORK_LABEL } from '../../constants/networks'
import NetworkModal from '../NetworkModal'
import styled from 'styled-components'
import { ButtonSecondary } from '../ButtonLegacy'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'
import { ChainId } from '@sushiswap/sdk'
import { Pressable, Text } from 'native-base'

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
                    <Text fontFamily="subheading" fontSize="sm" color="white">
                        {i18n._(t`Unsupported network`)}
                    </Text>
                </Web3StatusError>
            ) : (
                <Pressable
                    onPress={toggleNetworkModal}
                    w={20}
                    h={10}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px={3}
                    py={2}
                    ml={2}
                    borderWidth="1"
                    borderRadius="12px"
                    borderColor="borderBlue"
                >
                    <div className="grid items-center grid-flow-col px-3 py-2 rounded-lg pointer-events-auto auto-cols-max">
                        <img
                            src={NETWORK_ICON[chainId]}
                            alt="Switch Network"
                            className="mr-2 rounded-md"
                            style={{ width: 22, height: 22 }}
                        />
                        <Text fontFamily="subheading" color="primary" fontSize="sm">
                            {NETWORK_LABEL[chainId]}
                        </Text>
                    </div>
                </Pressable>
            )}
            <NetworkModal />
        </>
    )
}

export default Web3Network
