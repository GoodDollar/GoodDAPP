import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import React, { useCallback, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { injected, walletlink } from '../../connectors'
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
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useMetaMask, { metaMaskRequests } from '../../hooks/useMetaMask'
import { UnsupportedChainId } from '../../sdk/utils/errors'

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
    } = props

    const { ethereum } = window
    const toggleNetworkModal = useNetworkModalToggle()
    const metaMaskInfo = useMetaMask()
    const handleEthereumNetworkSwitch = useCallback(() => {
        const networkType = process.env.REACT_APP_NETWORK || 'staging'
        if (networkType === 'staging') {
            toggleNetworkModal()
        } else if (networkType === 'production') {
            metaMaskRequests(metaMaskInfo, 'switch')
            toggleWalletModal()
        }
    }, [ethereum, toggleNetworkModal, toggleWalletModal])

    const handleFuseNetworkSwitch = useCallback(() => {
        metaMaskRequests(metaMaskInfo, 'add', account)
        toggleWalletModal()
    }, [account, ethereum, toggleWalletModal])




    console.log('walletmodal metaMask Info -->', {metaMaskInfo})
    if (error) {
        return (
            <UpperSection>
                <CloseIcon onClick={toggleWalletModal}>
                    <CloseColor />
                </CloseIcon>
                <HeaderRow className="justify-center">
                    {error instanceof UnsupportedChainId ? i18n._(t`Wrong Network`) : i18n._(t`Error connecting`)}
                </HeaderRow>
                <ContentWrapper>
                    {error instanceof UnsupportedChainId ? (
                        <>
                            <h5 className="text-center">{i18n._(t`Please connect to the appropriate network.`)}</h5>
                            {(metaMaskInfo.isMetaMask || window.walletLinkExtension) && (
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
      <></>
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

    const { active, account, error } = useActiveWeb3React()

    const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

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
          setWalletView(WALLET_VIEWS.ACCOUNT)
        }
    }, [walletModalOpen])


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
                    />
                </Wrapper>
            </Modal>
            <NetworkModal />
        </>
    )
}
