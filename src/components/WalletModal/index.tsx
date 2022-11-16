import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/types'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import { useLingui } from '@lingui/react'
import NetworkModal from 'components/NetworkModal'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const Wrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    margin: 0;
    padding: 0;
    width: 100%;
`

const WALLET_VIEWS = {
    OPTIONS: 'options',
    OPTIONS_SECONDARY: 'options_secondary',
    ACCOUNT: 'account',
    PENDING: 'pending',
}

const ModalContent = (props: any) => {
    const {
        account,
        toggleWalletModal,
        walletView,
        pendingTransactions,
        confirmedTransactions,
        ENSName,
        setWalletView,
    } = props

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
    return <></>
}

export default function WalletModal({
    pendingTransactions,
    confirmedTransactions,
    ENSName,
}: {
    pendingTransactions: string[] // hashes of pending
    confirmedTransactions: string[] // hashes of confirmed
    ENSName?: string
}): React.ReactElement {
    const { i18n } = useLingui()

    const { account, error } = useActiveWeb3React()

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
