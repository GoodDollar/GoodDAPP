/***
 * Button to request network switch if not on correct network, or perform an action if on correct network
 */
import React from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { ButtonAction } from './index'
import { useLingui } from '@lingui/react'
import { DAO_NETWORK, SupportedChainId } from '@gooddollar/web3sdk'
import { useNetworkModalToggle } from 'state/application/hooks'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ActionOrSwitchButton = ({
    requireNetwork,
    children,
    ButtonEl = ButtonAction,
    ...props
}: {
    width?: string
    borderRadius?: string
    error?: boolean
    size?: 'default' | 'sm'
    noShadow?: boolean
    requireNetwork: DAO_NETWORK
    children: any
    onClick?: any
    ButtonEl?: any
    disabled?: boolean
    className?: string,
    page?: string
}) => {
    const toggleNetworkModal = useNetworkModalToggle()
    const { i18n } = useLingui()
    const { chainId, account } = useActiveWeb3React()
    // useEffect(() => { }, [chainId, account])
    if (
        (chainId === (SupportedChainId.FUSE as number) && requireNetwork === DAO_NETWORK.FUSE) ||
        (chainId !== (SupportedChainId.FUSE as number) && requireNetwork === DAO_NETWORK.MAINNET)
    )
        return <ButtonEl {...props}>{children}</ButtonEl>

    return (
        <ButtonEl {...props} width={props.page === 'Stake' ? '130px' : props.width} onClick={toggleNetworkModal}>
            {i18n._(`Switch to {network}`, { network: requireNetwork })}
        </ButtonEl>
    )
}
