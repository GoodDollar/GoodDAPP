import React from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'
import { noop } from 'lodash'
import { useBreakpointValue } from 'native-base'
import { Web3ActionButton } from '@gooddollar/good-design'
import { SupportedChains } from '@gooddollar/web3sdk-v2'

/**
 * Just a button to trigger the onboard connect modal.
 * any state updates after succesfully connecting are handled by useOnboardConnect (src/hooks/useActiveOnboard)
 * @returns Connect Button or Empty
 */

export function OnboardConnectButton(): JSX.Element {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
    const sendData = useSendAnalyticsData()
    const { i18n } = useLingui()
    const buttonText = i18n._(t`Connect to a wallet`)
    const variant = useBreakpointValue({
        base: 'mobile',
        lg: 'outlined',
    })

    const onWalletConnect = async () => {
        sendData({ event: 'wallet_connect', action: 'wallet_connect_start' })
        await connect().catch(noop)
        return false
    }

    if (wallet) {
        return <></>
    }

    return (
        <Web3ActionButton
            text={buttonText}
            web3Action={noop}
            requiredChain={SupportedChains.CELO}
            handleConnect={onWalletConnect}
            variant={variant}
        />
    )
}
