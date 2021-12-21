import React, { useCallback, useContext } from 'react'
import { useDispatch } from 'react-redux'
import styled, { useTheme } from 'styled-components'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { injected, walletconnect } from '../../connectors'
import { SUPPORTED_WALLETS } from '../../constants'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { AppDispatch } from '../../state'
import { clearAllTransactions } from '../../state/transactions/actions'
import { ExternalLink } from '../../theme'
import { getExplorerLink, shortenAddress } from '../../utils'
import Identicon from '../Identicon'
import { AutoRow } from '../Row'
import Copy from './Copy'
import Transaction from './Transaction'
import Title from '../gd/Title'
import { ButtonOutlined } from '../gd/Button'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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

const InfoCard = styled.div`
    // padding: 1rem;
    // border: 1px solid ${({ theme }) => theme.bg3};
    // border-radius: 10px;
    position: relative;
    display: grid;
    margin-bottom: 20px;
`

const AccountGroupingRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    justify-content: space-between;
    align-items: center;

    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: ${({ theme }) => theme.color.text1};

    div {
        ${({ theme }) => theme.flexRowNoWrap}
        align-items: center;
    }
`

const AccountSection = styled.div`
    // background-color: ${({ theme }) => theme.bg1};
    padding: 0rem 1rem;
    ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1.5rem 1rem;`};
`

const YourAccount = styled.div`
    h5 {
        margin: 0 0 1rem 0;
        font-weight: 400;
    }

    h4 {
        margin: 0;
        font-weight: 500;
    }
`

const LowerSection = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    padding: 1.5rem 1rem;
    flex-grow: 1;
    overflow: auto;
    // background-color: ${({ theme }) => theme.bg2};
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: ${({ theme }) => theme.color.text1};

    h5 {
        margin: 0;
        font-weight: 400;
        color: ${({ theme }) => theme.text3};
    }
`

const AccountControl = styled.div`
    display: flex;
    justify-content: space-between;
    min-width: 0;
    width: 100%;

    font-style: normal;
    font-weight: normal;
    font-size: 24px;
    line-height: 28px;
    color: ${({ theme }) => theme.color.text7};

    a:hover {
        text-decoration: underline;
    }

    p {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`

const AddressLink = styled(ExternalLink) <{ hasENS: boolean; isENS: boolean }>`
    margin-left: 1rem;
    display: flex;

    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    text-decoration-line: underline;
    color: ${({ theme }) => theme.color.text2};
`

const CloseIcon = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    &:hover {
        cursor: pointer;
        opacity: 0.6;
    }
`

const CloseColor = styled(Close)`
    path {
        fill: ${({ theme }) => theme.color.text8};
    }
`

const IconWrapper = styled.div<{ size?: number }>`
    ${({ theme }) => theme.flexColumnNoWrap};
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    & > img,
    span {
        height: ${({ size }) => (size ? size + 'px' : '32px')};
        width: ${({ size }) => (size ? size + 'px' : '32px')};
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

const TransactionListWrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap};
`

const WalletAction = styled(ButtonOutlined)``

function renderTransactions(transactions: string[]) {
    return (
        <TransactionListWrapper>
            {transactions.map((hash, i) => {
                return <Transaction key={i} hash={hash} />
            })}
        </TransactionListWrapper>
    )
}

interface AccountDetailsProps {
    toggleWalletModal: () => void
    pendingTransactions: string[]
    confirmedTransactions: string[]
    ENSName?: string
    openOptions: () => void
}

export default function AccountDetails({
    toggleWalletModal,
    pendingTransactions,
    confirmedTransactions,
    ENSName,
    openOptions
}: AccountDetailsProps): any {
    const { i18n } = useLingui()
    const { chainId, account, connector } = useActiveWeb3React()
    const dispatch = useDispatch<AppDispatch>()

    function formatConnectorName() {
        const { ethereum } = window
        const isMetaMask = !!(ethereum && ethereum.isMetaMask)
        const name = Object.keys(SUPPORTED_WALLETS)
            .filter(
                k =>
                    SUPPORTED_WALLETS[k].connector === connector &&
                    (connector !== injected || isMetaMask === (k === 'METAMASK'))
            )
            .map(k => SUPPORTED_WALLETS[k].name)[0]
        return `${i18n._(t`Connected with`)} ${name}`
    }

    const clearAllTransactionsCallback = useCallback(() => {
        if (chainId) dispatch(clearAllTransactions({ chainId }))
    }, [dispatch, chainId])

    return (
        <>
            <UpperSection>
                <CloseIcon onClick={toggleWalletModal}>
                    <CloseColor />
                </CloseIcon>
                <Title className="text-center mb-8">{i18n._(t`Account`)}</Title>
                <AccountSection>
                    <YourAccount>
                        <InfoCard>
                            <AccountGroupingRow>
                                {formatConnectorName()}
                                <div>
                                    {/*{connector !== injected && connector !== walletlink && (
                                        <WalletAction
                                            style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px' }}
                                            onClick={() => {
                                                ;(connector as any).close()
                                            }}
                                        >
                                            Disconnect
                                        </WalletAction>
                                    )}*/}
                                    <WalletAction
                                        width={'75px'}
                                        size="sm"
                                        onClick={() => {
                                            openOptions()
                                        }}
                                    >
                                        {i18n._(t`Change`)}
                                    </WalletAction>
                                </div>
                            </AccountGroupingRow>
                            <AccountGroupingRow id="web3-account-identifier-row">
                                <AccountControl>
                                    {ENSName ? (
                                        <>
                                            <div>
                                                <p> {ENSName}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p> {account && shortenAddress(account)}</p>
                                            </div>
                                        </>
                                    )}
                                </AccountControl>
                            </AccountGroupingRow>
                            <AccountGroupingRow className="mt-4">
                                {ENSName ? (
                                    <>
                                        <AccountControl>
                                            <div>
                                                {account && (
                                                    <Copy toCopy={account}>
                                                        <span style={{ marginLeft: '4px' }}>{i18n._(t`Copy address`)}</span>
                                                    </Copy>
                                                )}
                                                {chainId && account && (
                                                    <AddressLink
                                                        hasENS={!!ENSName}
                                                        isENS={true}
                                                        href={chainId && getExplorerLink(chainId, ENSName, 'address')}
                                                    >
                                                        <span style={{ marginLeft: '4px' }}>{i18n._(t`View on explorer`)}</span>
                                                    </AddressLink>
                                                )}
                                            </div>
                                        </AccountControl>
                                    </>
                                ) : (
                                    <>
                                        <AccountControl>
                                            <div>
                                                {account && (
                                                    <Copy toCopy={account}>
                                                        <span style={{ marginLeft: '4px' }}>{i18n._(t`Copy address`)}</span>
                                                    </Copy>
                                                )}
                                                {chainId && account && (
                                                    <AddressLink
                                                        hasENS={!!ENSName}
                                                        isENS={false}
                                                        href={getExplorerLink(chainId, account, 'address')}
                                                    >
                                                        <span style={{ marginLeft: '4px' }}>{i18n._(t`View on explorer`)}</span>
                                                    </AddressLink>
                                                )}
                                            </div>
                                        </AccountControl>
                                    </>
                                )}
                            </AccountGroupingRow>
                        </InfoCard>
                    </YourAccount>
                </AccountSection>
            </UpperSection>
            {!!pendingTransactions.length || !!confirmedTransactions.length ? (
                <LowerSection>
                    <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
                        <Title type="category">{i18n._(t`Recent Transactions`)}</Title>
                        <ButtonOutlined className="px-2" size="sm" width="auto" onClick={clearAllTransactionsCallback}>
                            {i18n._(t`Clear all`)}
                        </ButtonOutlined>
                    </AutoRow>
                    {renderTransactions(pendingTransactions)}
                    {renderTransactions(confirmedTransactions)}
                </LowerSection>
            ) : (
                <LowerSection>{i18n._(t`Your transactions will appear here...`)}</LowerSection>
            )}
        </>
    )
}
