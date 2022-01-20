import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import React, { useCallback, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { injected } from '../../connectors'
import { SUPPORTED_WALLETS } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/types'
import { useModalOpen, useNetworkModalToggle, useWalletModalToggle } from '../../state/application/hooks'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import Option from './Option'
import PendingView from './PendingView'
import Title from '../gd/Title'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ButtonAction } from 'components/gd/Button'
import NetworkModal from 'components/NetworkModal'
import { ChainId } from '@sushiswap/sdk'

const CloseIcon = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
`

const CloseColor = styled(Close)`
    path {
        fill: ${({ theme }) => theme.color.text8};
    }
`

const Wrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    margin: 0;
    padding: 0;
    width: 100%;
`

const HeaderRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1rem 1rem;
    font-weight: 500;
    color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
    ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
    // background-color: ${({ theme }) => theme.bg2};
     padding: 0 1rem;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const UpperSection = styled.div`
    position: relative;

    h5 {
        margin: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 400;
    }

    h5:last-child {
        margin-bottom: 0px;
    }

    h4 {
        margin-top: 0;
        font-weight: 500;
    }
`

const Blurb = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 2rem;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`

const OptionGrid = styled.div`
    display: grid;
    grid-gap: 10px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
    :hover {
        cursor: pointer;
    }
`

const WALLET_VIEWS = {
    OPTIONS: 'options',
    OPTIONS_SECONDARY: 'options_secondary',
    ACCOUNT: 'account',
    PENDING: 'pending'
}

const ModalContent = (props: any) => {
    const {
        error,
        account,
        toggleWalletModal,
        i18n,
        walletView,
        pendingTransactions,
        confirmedTransactions,
        ENSName,
        setWalletView,
        pendingWallet,
        pendingError,
        setPendingError,
        tryActivation,
        connector
    } = props

    const { ethereum } = window
    const toggleNetworkModal = useNetworkModalToggle()

    const handleEthereumNetworkSwitch = useCallback(() => {
        const networkType = process.env.REACT_APP_NETWORK || 'staging'
        if (networkType === 'staging') {
            toggleNetworkModal()
        } else if (networkType === 'production') {
            ;(ethereum as any)?.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${ChainId.MAINNET.toString(16)}` }]
            })
            toggleWalletModal()
        }
    }, [ethereum, toggleNetworkModal, toggleWalletModal])

    const handleFuseNetworkSwitch = useCallback(() => {
        ;(ethereum as any)?.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: '0x7a',
                    chainName: 'Fuse',
                    nativeCurrency: {
                        name: 'FUSE Token',
                        symbol: 'FUSE',
                        decimals: 18
                    },
                    rpcUrls: ['https://rpc.fuse.io'],
                    blockExplorerUrls: ['https://explorer.fuse.io']
                },
                account
            ]
        })
        toggleWalletModal()
    }, [account, ethereum, toggleWalletModal])

    function getOptions() {
        const isMetamask = window.ethereum && window.ethereum.isMetaMask

        return Object.keys(SUPPORTED_WALLETS).map(key => {
            const option = SUPPORTED_WALLETS[key]

            // check for mobile options
            if (isMobile) {
                if (!window.web3 && !window.ethereum && option.mobile) {
                    return (
                        <Option
                            onClick={() => {
                                option.connector !== connector && !option.href && tryActivation(option.connector)
                            }}
                            id={`connect-${key}`}
                            key={key}
                            active={option.connector && option.connector === connector}
                            link={option.href}
                            header={option.name}
                            subheader={null}
                            icon={require('../../assets/images/' + option.iconName).default}
                        />
                    )
                }
                return null
            }

            // overwrite injected when needed
            if (option.connector === injected) {
                // don't show injected if there's no injected provider
                if (!(window.web3 || window.ethereum)) {
                    if (option.name === 'MetaMask') {
                        return (
                            <Option
                                id={`connect-${key}`}
                                key={key}
                                color={'#E8831D'}
                                header={'Install Metamask'}
                                subheader={null}
                                link={'https://metamask.io/'}
                                icon={MetamaskIcon}
                            />
                        )
                    } else {
                        return null //dont want to return install twice
                    }
                }
                // don't return metamask if injected provider isn't metamask
                else if (option.name === 'MetaMask' && !isMetamask) {
                    return null
                }
                // likewise for generic
                else if (option.name === 'Injected' && isMetamask) {
                    return null
                }
            }

            // return rest of options
            return (
                !isMobile &&
                !option.mobileOnly && (
                    <Option
                        id={`connect-${key}`}
                        onClick={() => {
                            option.connector === connector
                                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                                : !option.href && tryActivation(option.connector)
                        }}
                        key={key}
                        active={option.connector === connector}
                        color={option.color}
                        link={option.href}
                        header={option.name}
                        subheader={null} //use option.descriptio to bring back multi-line
                        icon={require('../../assets/images/' + option.iconName).default}
                    />
                )
            )
        })
    }

    const isMetaMask = window.ethereum && window.ethereum.isMetaMask

    if (error) {
        return (
            <UpperSection>
                <CloseIcon onClick={toggleWalletModal}>
                    <CloseColor />
                </CloseIcon>
                <HeaderRow className="justify-center">
                    {error instanceof UnsupportedChainIdError ? i18n._(t`Wrong Network`) : i18n._(t`Error connecting`)}
                </HeaderRow>
                <ContentWrapper>
                    {error instanceof UnsupportedChainIdError ? (
                        <>
                            <h5 className="text-center">{i18n._(t`Please connect to the appropriate network.`)}</h5>
                            {isMetaMask && (
                                <div className="flex flex-row align-center justify-around mt-5 pt-2">
                                    <ButtonAction
                                        size="sm"
                                        width="40%"
                                        onClick={handleEthereumNetworkSwitch}
                                        borderRadius="6px"
                                    >
                                        {i18n._(t`ETHEREUM`)}
                                    </ButtonAction>
                                    <ButtonAction
                                        size="sm"
                                        width="40%"
                                        onClick={handleFuseNetworkSwitch}
                                        borderRadius="6px"
                                    >
                                        {i18n._(t`FUSE`)}
                                    </ButtonAction>
                                </div>
                            )}
                        </>
                    ) : (
                        i18n._(t`Error connecting. Try refreshing the page.`)
                    )}
                </ContentWrapper>
            </UpperSection>
        )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
        return (
            <AccountDetails
                toggleWalletModal={toggleWalletModal}
                pendingTransactions={pendingTransactions}
                confirmedTransactions={confirmedTransactions}
                ENSName={ENSName}
                openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
            />
        )
    }
    return (
        <UpperSection>
            <CloseIcon onClick={toggleWalletModal}>
                <CloseColor />
            </CloseIcon>
            <Title className="text-center">Connect wallet</Title>
            <ContentWrapper className="mt-8">
                {walletView === WALLET_VIEWS.PENDING ? (
                    <PendingView
                        connector={pendingWallet}
                        error={pendingError}
                        setPendingError={setPendingError}
                        tryActivation={tryActivation}
                    />
                ) : (
                    <OptionGrid>{getOptions()}</OptionGrid>
                )}
                {/*{walletView !== WALLET_VIEWS.PENDING && (
                    <Blurb>
                        <span>New to Ethereum? &nbsp;</span>{' '}
                        <ExternalLink href="https://ethereum.org/wallets/">Learn more about wallets</ExternalLink>
                    </Blurb>
                )}*/}
            </ContentWrapper>
        </UpperSection>
    )
}

export default function WalletModal({
    pendingTransactions,
    confirmedTransactions,
    ENSName
}: {
    pendingTransactions: string[] // hashes of pending
    confirmedTransactions: string[] // hashes of confirmed
    ENSName?: string
}): React.ReactElement {
    const { i18n } = useLingui()
    // important that these are destructed from the account-specific web3-react context
    const { active, account, connector, activate, error } = useWeb3React()

    const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

    const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

    const [pendingError, setPendingError] = useState<boolean>()

    const walletModalOpen = useModalOpen(ApplicationModal.WALLET)

    const toggleWalletModal = useWalletModalToggle()

    const previousAccount = usePrevious(account)

    // close on connection, when logged out before
    useEffect(() => {
        if (account && !previousAccount && walletModalOpen) {
            toggleWalletModal()
        }
    }, [account, previousAccount, toggleWalletModal, walletModalOpen])

    // always reset to account view
    useEffect(() => {
        if (walletModalOpen) {
            setPendingError(false)
            setWalletView(WALLET_VIEWS.ACCOUNT)
        }
    }, [walletModalOpen])

    // close modal when a connection is successful
    const activePrevious = usePrevious(active)
    const connectorPrevious = usePrevious(connector)
    useEffect(() => {
        if (
            walletModalOpen &&
            ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))
        ) {
            setWalletView(WALLET_VIEWS.ACCOUNT)
        }
    }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

    const tryActivation = async (connector: AbstractConnector | undefined) => {
        let name = ''
        Object.keys(SUPPORTED_WALLETS).map(key => {
            if (connector === SUPPORTED_WALLETS[key].connector) {
                return (name = SUPPORTED_WALLETS[key].name)
            }
            return true
        })
        // log selected wallet

        setPendingWallet(connector) // set wallet for pending view
        setWalletView(WALLET_VIEWS.PENDING)

        // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
        if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
            connector.walletConnectProvider = undefined
        }

        connector &&
            activate(connector, undefined, true).catch(error => {
                if (error instanceof UnsupportedChainIdError) {
                    activate(connector) // a little janky...can't use setError because the connector isn't set
                } else {
                    setPendingError(true)
                }
            })
    }

    return (
        <>
            <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
                <Wrapper>
                    <ModalContent
                        error={error}
                        account={account}
                        toggleWalletModal={toggleWalletModal}
                        i18n={i18n}
                        walletView={walletView}
                        setWalletView={setWalletView}
                        pendingTransactions={pendingTransactions}
                        confirmedTransactions={confirmedTransactions}
                        ENSName={ENSName}
                        pendingWallet={pendingWallet}
                        pendingError={pendingError}
                        setPendingError={setPendingError}
                        tryActivation={tryActivation}
                        connector={connector}
                    />
                </Wrapper>
            </Modal>
            <NetworkModal />
        </>
    )
}
