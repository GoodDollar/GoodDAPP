import { check, claim, isWhitelisted, SupportedChainId, useGdContextProvider } from '@gooddollar/web3sdk'
import { useCallback, useEffect, useState } from 'react'
import usePromise from './usePromise'
import useActiveWeb3React from './useActiveWeb3React'
import useSendAnalyticsData from './useSendAnalyticsData'
import { useClaim, useTimer } from '@gooddollar/web3sdk-v2'

interface UseClaimReturn {
    claimable?: boolean | Error
    tillClaim: string
    handleClaim: () => Promise<boolean>
    isFuse: boolean
    claimActive: boolean
    claimed: boolean
}

export const useClaiming = (): UseClaimReturn => {
    const { chainId, account } = useActiveWeb3React()
    const network = SupportedChainId[chainId]
    const { web3 } = useGdContextProvider()
    const sendData = useSendAnalyticsData()
    const { claimTime } = useClaim()

    const [claimed, setIsClaimed] = useState(false)
    const [nextClaim, , setClaimTime] = useTimer(claimTime)

    useEffect(() => setClaimTime(claimTime), [claimTime.toString()])

    const [claimable, , , refetch] = usePromise(async () => {
        if (!account || !web3 || (chainId as any) !== SupportedChainId.FUSE) return false
        const whitelisted = await isWhitelisted(web3, account).catch((e) => {
            console.error(e)
            return false
        })

        if (!whitelisted) return new Error('Only verified wallets can claim')

        const amount = await check(web3, account).catch((e) => {
            console.error(e)
            return new Error('Something went wrong.. try again later.')
        })
        if (amount instanceof Error) return amount

        if (amount === '0') {
            setIsClaimed(true)
        }

        return /[^0.]/.test(amount)
    }, [chainId, web3, account])

    const handleClaim = useCallback(async () => {
        if (!account || !web3) {
            return false
        }

        sendData({ event: 'claim', action: 'claimStart', network })

        const startClaim = await claim(web3, account).catch(() => {
            refetch()
            return false
        })

        if (!startClaim) {
            return false
        }

        sendData({ event: 'claim', action: 'claimSuccess', network })
        refetch()
        return true
    }, [account, web3, sendData, network, refetch])

    const isFuse = (chainId as any) === SupportedChainId.FUSE

    return { claimed, claimable, tillClaim: nextClaim, isFuse, claimActive: isFuse && claimable === true, handleClaim }
}
