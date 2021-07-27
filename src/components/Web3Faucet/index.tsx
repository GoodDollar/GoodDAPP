import React from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { ButtonDefault } from '../gd/Button'
import { SupportedChainId } from '../../sdk/constants/chains'

function Web3Faucet(): JSX.Element | null {
    const { chainId } = useActiveWeb3React()

    return (
        <ButtonDefault className="px-5" borderRadius="6px" disabled={(chainId as any) !== SupportedChainId.FUSE}>
            Claim UBI
        </ButtonDefault>
    )
}

export default Web3Faucet
