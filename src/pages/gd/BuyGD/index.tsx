import React, { memo, useCallback } from 'react'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { CentreBox, Converter, GdOnramperWidget, SlideDownTab, Title } from '@gooddollar/good-design'
import { Box, Text, useBreakpointValue } from 'native-base'
import { g$Price } from '@gooddollar/web3sdk'
import { useGetEnvChainId } from '@gooddollar/web3sdk-v2'

import usePromise from 'hooks/usePromise'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'

const BuyGd = memo(() => {
    const sendData = useSendAnalyticsData()

    const { connectedEnv } = useGetEnvChainId(42220)
    const isProd = connectedEnv.includes('production')

    const handleEvents = useCallback(
        (event: string, data?: any, error?: string) => {
            sendData({ event: 'buy', action: event, ...(error && { error: error }) })
        },
        [sendData]
    )

    const [G$Price] = usePromise(
        () =>
            g$Price()
                .then(({ DAI }) => +DAI.toSignificant(6))
                .catch(() => undefined),
        []
    )

    const mainView = useBreakpointValue({
        base: {
            gap: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            width: '100%',
            mb: 2,
        },
        lg: {
            flexDirection: 'row',
            justifyContent: 'justify-evenly',
        },
    })

    const leftContainer = useBreakpointValue({
        lg: {
            paddingRight: 40,
            paddingLeft: 63,
            alignItems: 'stretch',
            borderRightWidth: 1,
        },
    })

    const rightContainer = useBreakpointValue({
        lg: {
            paddingLeft: 40,
            paddingTop: 60,
            w: '60%',
        },
    })

    const containerCopy = useBreakpointValue({
        base: {
            width: 350,
            fontSize: 'sm',
        },
        lg: {
            width: 600,
        },
    })

    const sideTabs = useBreakpointValue({
        base: {
            alignItems: 'center',
        },
        lg: {
            alignItems: 'flex-start',
        },
    })

    const onrampWrapper = useBreakpointValue({
        base: {
            width: '110%',
        },
        lg: {
            width: '100%',
        },
    })

    return (
        <Box w="100%" mb="8" style={mainView}>
            <CentreBox borderColor="borderGrey" style={leftContainer}>
                <Title fontFamily="heading" fontSize="2xl" fontWeight="extrabold" pb="2" textAlign="center">
                    {i18n._(t`Buy G$`)}
                </Title>

                <Text
                    style={containerCopy}
                    alignSelf="center"
                    color="goodGrey.500"
                    fontFamily="subheading"
                    fontWeight="normal"
                    mb={6}
                >
                    {i18n._(
                        t`Support global financial inclusion and contribute to social impact by purchasing GoodDollars (G$).`
                    )}
                </Text>
                <Text
                    style={containerCopy}
                    alignSelf="center"
                    color="goodGrey.500"
                    fontFamily="subheading"
                    fontWeight="bold"
                    mb={6}
                >
                    {i18n._(
                        t`
                Choose the currency you want to use and buy cUSD. Your cUSD is then automatically converted into G$.`
                    )}
                </Text>
                {/* todo: width on mobile should be more responsive */}
                <Box style={onrampWrapper}>
                    <GdOnramperWidget
                        isTesting={!isProd}
                        onEvents={handleEvents}
                        apiKey={process.env.REACT_APP_ONRAMPER_KEY}
                    />
                </Box>
            </CentreBox>
            <CentreBox w="100%" justifyContent="flex-start" style={rightContainer}>
                <Box w="100%" mb={6} style={sideTabs}>
                    {G$Price && (
                        <SlideDownTab tabTitle="G$ Calculator">
                            <Converter gdPrice={G$Price} />
                        </SlideDownTab>
                    )}
                </Box>
                <Box w="100%" mb={6} style={sideTabs}>
                    <SlideDownTab tabTitle="FAQ">
                        <Text
                            textAlign="center"
                            w={350}
                            fontFamily="subheading"
                            fontWeight="bold"
                            color="goodGrey.500"
                            fontSize="sm"
                            mb={10}
                            mt={4}
                        >
                            {i18n._(t`Why haven't my funds arrived yet?`)}
                        </Text>
                        <Text w={350} fontFamily="subheading" fontWeight="normal" color="goodGrey.400" fontSize="sm">
                            {i18n._(
                                t`The widget in this page is a third-party service provided by Onramper. Please note that the verification of your transaction by Onramper may take up to 24 hours to complete. Following verification, it may take up to 3 business days for GoodDollars to be available in your wallet. In the event that the process takes longer, after receiving a confirmation email from your payment provider, please return to this screen to check the status of your transaction.`
                            )}
                        </Text>
                    </SlideDownTab>
                </Box>
            </CentreBox>
        </Box>
    )
})

export default BuyGd
