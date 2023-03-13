import { useG$Balance, useG$Tokens, AsyncStorage, SupportedV2Networks } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import WalletBalance from 'components/WalletBalance'
import React, { useState, useMemo } from 'react'
import { ReactComponent as WalletBalanceIcon } from '../assets/images/walletBalanceIcon.svg'
import DiscordLogo from '../assets/images/discord-logo-new.png'
import TelegramLogo from '../assets/images/telegram.png'
import TwitterLogo from '../assets/images/twitter.png'
import useActiveWeb3React from '../hooks/useActiveWeb3React'
import useMetaMask from '../hooks/useMetaMask'
import { useApplicationTheme } from '../state/application/hooks'
import LanguageSwitch from './LanguageSwitch'
import { NavLink } from './Link'
import usePromise from '../hooks/usePromise'
import { ExternalLink } from 'theme'
import { Text, Box, View, useBreakpointValue, HStack, useColorModeValue, ScrollView } from 'native-base'

const SocialsLink: React.FC<{ network: string; logo: string; url: string }> = ({ network, logo, url }) => (
    <a href={url} target="_blank" className="flex items-center space-x-2" rel="noreferrer">
        <img src={logo} alt={`${network} logo`} width="20" height="20" />
    </a>
)

export default function SideBar({ mobile, closeSidebar }: { mobile?: boolean; closeSidebar?: any }): JSX.Element {
    const [theme, setTheme] = useApplicationTheme()
    const { i18n } = useLingui()
    const { ethereum } = window
    const { chainId, account } = useActiveWeb3React()
    const metaMaskInfo = useMetaMask()
    const balances = useG$Balance(5)
    const [G$, GOOD, GDX] = useG$Tokens()
    const [imported, setImported] = useState<boolean>(false)

    const bgContainer = useColorModeValue('goodWhite.100', '#151A30')
    const bgWalletBalance = useColorModeValue('white', '#1a1f38')
    const textColor = useColorModeValue('goodGrey.700', 'goodGrey.300')
    const containerStyles = useBreakpointValue({
        base: {
            width: '90%',
            flexShrink: 0,
            // height: '100%',
            transition: 'all 1s ease',
            display: 'grid',
            paddingBottom: 0,
            height: '590px',
            gap: '1px',
            // paddingLeft: '18px',
        },
        lg: {
            width: '258px',
            height: 'auto',
            display: 'flex',
        },
    })

    const importToMetamask = async () => {
        const allTokens = []
        allTokens.push({
            type: 'ERC20',
            options: {
                address: G$.address,
                symbol: G$.ticker,
                decimals: G$.decimals,
                image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
            },
        })
        allTokens.push({
            type: 'ERC20',
            options: {
                address: GOOD.address,
                symbol: GOOD.ticker,
                decimals: GOOD.decimals,
                image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
            },
        })

        if (!SupportedV2Networks[chainId] && balances.GDX)
            allTokens.push({
                type: 'ERC20',
                options: {
                    address: GDX.address,
                    symbol: GDX.ticker,
                    decimals: GDX.decimals,
                    image: 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gdx-logo.png',
                },
            })

        void Promise.all(
            allTokens.map(async (token) => {
                // todo: fix multiple requests bug after succesfully adding all assets.
                //IE. wallet_watchAsset auto triggered when switching chain
                metaMaskInfo.isMultiple
                    ? ethereum?.selectedProvider?.request &&
                      (await ethereum.selectedProvider.request({
                          method: 'wallet_watchAsset',
                          params: token,
                      }))
                    : ethereum?.request &&
                      (await ethereum.request({
                          method: 'wallet_watchAsset',
                          params: token,
                      }))
            })
        ).then(async () => {
            setImported(true)
            await AsyncStorage.setItem(`${chainId}_metamask_import_status`, true)
        })
    }

    const [loading] = usePromise(async () => {
        const imported = await AsyncStorage.getItem(`${chainId}_metamask_import_status`)
        setImported(imported)
        return imported
    }, [chainId])

    const onTabClick = () => {
        if (mobile) {
            closeSidebar()
        }
    }

    const externalLinks = useMemo(
        () => [
            {
                label: i18n._(t`Multichain Bridge`),
                url: 'https://app.multichain.org',
                dataAttr: 'multichain',
                withIcon: true,
                show: process.env.REACT_APP_CELO_PHASE_1,
            },
            {
                label: i18n._(t`Wallet`),
                url: 'https://wallet.gooddollar.org',
                dataAttr: 'wallet',
                withIcon: true,
                show: true,
            },
            {
                label: i18n._(t`Fuse Bridge`),
                url: 'https://app.fuse.fi/#/bridge',
                dataAttr: 'bridge',
                withIcon: true,
                show: true,
            },
            {
                label: i18n._(t`Docs`),
                url: 'https://docs.gooddollar.org',
                dataAttr: 'docs',
                withIcon: true,
                show: true,
            },
            {
                label: i18n._(t`Good Airdrop`),
                url: 'https://airdrop.gooddollar.org',
                dataAttr: 'airdrop',
                withIcon: true,
                show: true,
            },
        ],
        [i18n, process.env]
    )

    const internalLinks = useMemo(
        () => [
            {
                route: '/claim',
                text: 'Claim',
                show: process.env.REACT_APP_CELO_PHASE_2,
            },
            {
                route: '/swap',
                text: 'Swap',
                show: true,
            },
            {
                route: '/stakes',
                text: 'Stake',
                show: true,
            },
            {
                route: '/portfolio',
                text: 'Portfolio',
                show: true,
            },
            {
                route: '/microbridge',
                text: 'Micro Bridge',
                show: process.env.REACT_APP_CELO_PHASE_3,
            },
            {
                route: '/dashboard',
                text: 'Dashboard',
                show: true,
            },
        ],
        [i18n, process.env]
    )

    return (
        <View
            flexDirection="column"
            backgroundColor={bgContainer}
            justifyContent="space-between"
            style={containerStyles}
        >
            <Box display="flex" justifyContent="center" flexDirection="column" px="6" py="4" bg={bgContainer}>
                {account && (
                    <Box px={4} pt={2} bg={bgWalletBalance} borderRadius="12px">
                        <div className="flex items-center gap-2">
                            <WalletBalanceIcon />
                            <Text fontFamily="subheading" fontSize="sm" fontWeight="normal" color={textColor}>
                                {i18n._(t`Wallet balance`)}
                            </Text>
                        </div>
                        <Box display="flex" flexDir="col" pl={8} pb={2}>
                            {account && <WalletBalance balances={balances} chainId={chainId} />}
                            {!loading && !imported && (
                                <Text fontFamily="subheading" fontSize="xs" onPress={importToMetamask} color="primary">
                                    Import to Metamask
                                </Text>
                            )}
                        </Box>
                    </Box>
                )}
                <ScrollView scrollEnabled={true} display="flex" flexDir="column">
                    {internalLinks
                        .filter((internal) => internal.show)
                        .map(({ route, text }) => (
                            <NavLink key={route} to={route} onPress={onTabClick}>
                                <Text>{text}</Text>
                            </NavLink>
                        ))}

                    {externalLinks
                        .filter((external) => external.show)
                        .map(({ label, url, dataAttr, withIcon }) => (
                            <ExternalLink key={label} label={label} url={url} dataAttr={dataAttr} withIcon={withIcon} />
                        ))}
                </ScrollView>

                <div className="flex flex-col justify-center h-20 gap-3 mt-2.5">
                    <div className="flex flex-row h-6 gap-10">
                        <div className="flex items-center justify-center">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 29 29"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex-shrink-0 cursor-pointer select-none"
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            >
                                {theme === 'dark' ? (
                                    <path
                                        d="M24.7564 10.2564V4.24359H18.7436L14.5 0L10.2564 4.24359H4.24359V10.2564L0 14.5L4.24359 18.7436V24.7564H10.2564L14.5 29L18.7436 24.7564H24.7564V18.7436L29 14.5L24.7564 10.2564ZM14.5 22.1923C10.2564 22.1923 6.80769 18.7436 6.80769 14.5C6.80769 10.2564 10.2564 6.80769 14.5 6.80769C18.7436 6.80769 22.1923 10.2564 22.1923 14.5C22.1923 18.7436 18.7436 22.1923 14.5 22.1923ZM14.5 9.37179C11.6667 9.37179 9.37179 11.6667 9.37179 14.5C9.37179 17.3333 11.6667 19.6282 14.5 19.6282C17.3333 19.6282 19.6282 17.3333 19.6282 14.5C19.6282 11.6667 17.3333 9.37179 14.5 9.37179Z"
                                        fill="#00B0FF"
                                    />
                                ) : (
                                    <path
                                        d="M24.1667 18.4996L28.1662 14.5L24.1667 10.5004V4.83332H18.4996L14.5 0.83374L10.5004 4.83332H4.83332V10.5004L0.83374 14.5L4.83332 18.4996V24.1667H10.5004L14.5 28.1662L18.4996 24.1667H24.1667V18.4996ZM14.5 21.75V7.24999C18.4996 7.24999 21.75 10.5004 21.75 14.5C21.75 18.4996 18.4996 21.75 14.5 21.75Z"
                                        fill="#00B0FF"
                                    />
                                )}
                            </svg>
                        </div>
                        <LanguageSwitch />
                    </div>
                    <Box
                        display="flex"
                        flexDir="row"
                        alignItems="center"
                        justifyContent="justify-start"
                        borderTopWidth={1}
                        borderTopColor="borderGrey"
                        pt={4}
                        pl={1}
                    >
                        <HStack space={10}>
                            <SocialsLink network="twitter" logo={TwitterLogo} url="https://twitter.com/gooddollarorg" />
                            <SocialsLink network="telegram" logo={TelegramLogo} url="https://t.me/GoodDollarX" />
                            <SocialsLink network="discord" logo={DiscordLogo} url="https://discord.gg/RKVHwdQtme" />
                        </HStack>
                    </Box>
                </div>
            </Box>
        </View>
    )
}
