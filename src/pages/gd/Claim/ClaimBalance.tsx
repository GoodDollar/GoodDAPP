import React, { useMemo, useCallback } from 'react'
import { View, Box, Text } from 'native-base'
import { ArrowButton, BalanceGD } from '@gooddollar/good-design'
import { SupportedChains } from '@gooddollar/web3sdk-v2'
import { useClaim } from '@gooddollar/web3sdk-v2'
import usePromise from 'hooks/usePromise'
import { g$Price } from '@gooddollar/web3sdk'
import { format } from 'date-fns'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useClaiming } from 'hooks/useClaiming'
import { noop } from 'lodash'
import { useEthers } from '@usedapp/core'

const NextClaim = ({ time }: { time: string }) => (
    <Text fontFamily="subheading" fontWeight="normal" fontSize="xs" color="main">
        Claim cycle restart every day at {time}
    </Text>
)

const ClaimTimer = () => {
    const { tillClaim } = useClaiming() // todo: update to timer from sdk-v2

    return (
        <Box height="50" justifyContent="center" flexDirection="column" my="4">
            <Text fontFamily="subheading" fontSize="md" color="main">
                Your next claim
            </Text>
            <Text>{tillClaim}</Text>
        </Box>
    )
}

export const ClaimBalance = () => {
    const { claimTime } = useClaim('everyBlock')
    const { chainId } = useActiveWeb3React()
    const [G$Price] = usePromise(
        () =>
            g$Price()
                .then(({ DAI }) => DAI)
                .catch(() => undefined),
        [chainId]
    )

    const formattedTime = useMemo(() => claimTime && format(claimTime, 'hh aaa'), [claimTime])
    const { switchNetwork } = useEthers()

    //note: we select the alternative chain where a user is able to claim their UBI
    const altChain = chainId === (SupportedChains.FUSE as number) ? SupportedChains[42220] : SupportedChains[122]

    const switchChain = useCallback(() => {
        switchNetwork(SupportedChains[altChain as keyof typeof SupportedChains]).catch(noop)
    }, [switchNetwork, altChain])

    return (
        <View textAlign="center" display="flex" justifyContent="center" flexDirection="column" w="full" mb="4">
            <Box backgroundColor="goodWhite.100" borderRadius="15" p="1" w="full" h="34" justifyContent="center">
                <NextClaim time={formattedTime || ''} />
            </Box>

            <ClaimTimer />
            <Box borderWidth="1" borderColor="borderGrey" width="90%" alignSelf="center" my="2" />
            <Box>
                <BalanceGD gdPrice={G$Price} />
            </Box>
            <Box alignItems="center">
                <ArrowButton
                    borderWidth="1"
                    borderColor="borderBlue"
                    px="6px"
                    width="200"
                    text={`Claim on ${altChain}`}
                    onPress={switchChain}
                    innerText={{
                        fontSize: 'sm',
                    }}
                />
            </Box>
        </View>
    )
}
