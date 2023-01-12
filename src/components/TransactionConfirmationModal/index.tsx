import { ChainId } from '@sushiswap/sdk'
import React from 'react'
import { AlertTriangle, ArrowUpCircle } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'
import Circle from '../../assets/images/blue-loader.svg'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { ExternalLink } from '../../theme'
import { CloseIcon, CustomLightSpinner } from '../../theme/components'
import { getExplorerLink } from '../../utils'
import { ButtonPrimary } from '../ButtonLegacy'
import { AutoColumn, ColumnCenter } from '../Column'
import Modal from '../Modal'
import Row, { RowBetween } from '../Row'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const Wrapper = styled.div`
    width: 100%;
    padding: 0 20px;
`
const Section = styled(AutoColumn)`
    // padding: 24px;
`

const BottomSection = styled(Section)`
    text-transform: uppercase;
`

const ConfirmedIcon = styled(ColumnCenter)`
    padding: 60px 0;
`

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
    const { i18n } = useLingui()

    return (
        <Wrapper>
            <Section>
                <RowBetween>
                    <div />
                    <CloseIcon onClick={onDismiss} />
                </RowBetween>
                <ConfirmedIcon>
                    <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
                </ConfirmedIcon>
                <AutoColumn gap="12px" justify={'center'}>
                    <Text fontWeight={500} fontSize={20}>
                        {i18n._(t`Waiting For Confirmation`)}
                    </Text>
                    <AutoColumn gap="12px" justify={'center'}>
                        <Text fontWeight={600} fontSize={14} color="" textAlign="center">
                            {pendingText}
                        </Text>
                    </AutoColumn>
                    <Text fontSize={12} color="#565A69" textAlign="center">
                        {i18n._(t`Confirm this transaction in your wallet`)}
                    </Text>
                </AutoColumn>
            </Section>
        </Wrapper>
    )
}

function TransactionSubmittedContent({
    onDismiss,
    chainId,
    hash,
}: {
    onDismiss: () => void
    hash: string | undefined
    chainId: ChainId
}) {
    const { i18n } = useLingui()
    const theme = useTheme()

    return (
        <Wrapper>
            <Section>
                <RowBetween>
                    <div />
                    <CloseIcon onClick={onDismiss} />
                </RowBetween>
                <ConfirmedIcon>
                    <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
                </ConfirmedIcon>
                <AutoColumn gap="12px" justify={'center'}>
                    <Text fontWeight={500} fontSize={20}>
                        {i18n._(t`Transaction Submitted`)}
                    </Text>
                    {chainId && hash && (
                        <ExternalLink
                            label={i18n._(t`View on explorer`)}
                            url={getExplorerLink(chainId, hash, 'transaction')}
                            dataAttr="external_explorer"
                        />
                    )}
                    <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
                        <Text fontWeight={500} fontSize={20}>
                            {i18n._(t`Close`)}
                        </Text>
                    </ButtonPrimary>
                </AutoColumn>
            </Section>
        </Wrapper>
    )
}

const Title = styled(Text)`
    font-weight: bold;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.color.text4};
`

export function ConfirmationModalContent({
    title,
    bottomContent,
    onDismiss,
    topContent,
}: {
    title: string
    onDismiss: () => void
    topContent: () => React.ReactNode
    bottomContent: () => React.ReactNode
}) {
    return (
        <Wrapper>
            <Section>
                <Row justify="center">
                    <Title>{title}</Title>
                    <CloseIcon onClick={onDismiss} abs />
                </Row>
                {topContent()}
            </Section>
            <BottomSection gap="12px">{bottomContent()}</BottomSection>
        </Wrapper>
    )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    const theme = useTheme()
    return (
        <Wrapper>
            <Section>
                <RowBetween>
                    <Text fontWeight={500} fontSize={20}>
                        Error
                    </Text>
                    <CloseIcon onClick={onDismiss} />
                </RowBetween>
                <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
                    <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
                    <Text
                        fontWeight={500}
                        fontSize={16}
                        color={theme.red1}
                        style={{ textAlign: 'center', width: '85%' }}
                    >
                        {message}
                    </Text>
                </AutoColumn>
            </Section>
            <BottomSection gap="12px">
                <ButtonPrimary onClick={onDismiss}>Dismiss</ButtonPrimary>
            </BottomSection>
        </Wrapper>
    )
}

interface ConfirmationModalProps {
    isOpen: boolean
    onDismiss: () => void
    hash: string | undefined
    content: () => React.ReactNode
    attemptingTxn: boolean
    pendingText: string
}

export default function TransactionConfirmationModal({
    isOpen,
    onDismiss,
    attemptingTxn,
    hash,
    pendingText,
    content,
}: ConfirmationModalProps) {
    const { chainId } = useActiveWeb3React()

    if (!chainId) return null

    // confirmation screen
    return (
        <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
            {attemptingTxn ? (
                <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
            ) : hash ? (
                <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
            ) : (
                content()
            )}
        </Modal>
    )
}
