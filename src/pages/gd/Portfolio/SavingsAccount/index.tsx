import React, { useEffect, useState } from 'react'
import { SavingsSDK, useGetEnvChainId, useReadOnlyProvider } from '@gooddollar/web3sdk-v2'
import { SavingsCard } from 'components/Savings/SavingsCard'
import { useLingui } from '@lingui/react'
import { PortfolioTitleSC } from '../styled'

export const SavingsAccount = ({
    account,
    requiredChain,
}: {
    account: string | null | undefined
    requiredChain: number
}): JSX.Element => {
    const [hasBalance, setHasBalance] = useState<boolean | undefined>(true)
    const { i18n } = useLingui()
    const { defaultEnv } = useGetEnvChainId(requiredChain)
    const provider = useReadOnlyProvider(requiredChain)

    useEffect(() => {
        if (account && provider) {
            const sdk = new SavingsSDK(provider, defaultEnv)
            void sdk.hasBalance(account).then((res) => {
                setHasBalance(res)
            })
        }
    }, [account, setHasBalance, provider, defaultEnv])

    return (
        <>
            <PortfolioTitleSC className="mt-4 mb-3 md:pl-2">{i18n._(`Savings`)}</PortfolioTitleSC>
            {account && <SavingsCard requiredChain={requiredChain} account={account} hasBalance={hasBalance} />}
        </>
    )
}
