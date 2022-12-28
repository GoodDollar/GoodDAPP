/***
 * Button to request network switch if not on correct network, or perform an action if on correct network
 */
import React, { FC } from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { ButtonAction } from './index'
import { useLingui } from '@lingui/react'
import { useNetworkModalToggle } from 'state/application/hooks'
import { SupportedChains } from '@gooddollar/web3sdk-v2'
import { useGdContextProvider } from '@gooddollar/web3sdk'

export interface ActionOrSwitchButtonProps {
    width?: string
    borderRadius?: string
    error?: boolean
    size?: 'default' | 'sm' | 'm'
    noShadow?: boolean
    requireChain: keyof typeof SupportedChains
    onClick?: any
    ButtonEl?: any
    disabled?: boolean
    className?: string
    page?: string
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ActionOrSwitchButton: FC<ActionOrSwitchButtonProps> = ({
    requireChain,
    children,
    ButtonEl = ButtonAction,
    ...props
}) => {
    const toggleNetworkModal = useNetworkModalToggle()
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const { contractsEnv } = useGdContextProvider()

    if (requireChain === 'MAINNET') {
        switch (contractsEnv) {
            case 'production':
                requireChain = 'MAINNET'
                break
        }
    }

    if (SupportedChains[requireChain] === (chainId as number)) {
        return <ButtonEl {...props}>{children}</ButtonEl>
    }

    return (
        <ButtonEl {...props} width={props.page === 'Stake' ? '130px' : props.width} onClick={toggleNetworkModal}>
            {i18n._(`Switch to {chain}`, { chain: requireChain })}
        </ButtonEl>
    )
}
