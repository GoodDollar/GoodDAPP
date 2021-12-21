import React, { useContext } from 'react'
import { ArrowUpCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import Circle from '../../assets/images/blue-loader.svg'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { CloseIcon, CustomLightSpinner, TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getExplorerLink } from '../../utils'
import { AutoColumn, ColumnCenter } from '../Column'
import { RowBetween } from '../Row'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const ConfirmOrLoadingWrapper = styled.div`
    width: 100%;
    padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
    padding: 60px 0;
`

export function LoadingView({ children, onDismiss }: { children: any; onDismiss: () => void }) {
    const { i18n } = useLingui()

    return (
        <ConfirmOrLoadingWrapper>
            <RowBetween>
                <div />
                <CloseIcon onClick={onDismiss} />
            </RowBetween>
            <ConfirmedIcon>
                <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            </ConfirmedIcon>
            <AutoColumn gap="100px" justify={'center'}>
                {children}
                <TYPE.subHeader>{i18n._(t`Confirm this transaction in your wallet`)}</TYPE.subHeader>
            </AutoColumn>
        </ConfirmOrLoadingWrapper>
    )
}

export function SubmittedView({
    children,
    onDismiss,
    hash
}: {
    children: any
    onDismiss: () => void
    hash: string | undefined
}) {
    const { i18n } = useLingui()
    const theme = useTheme()
    const { chainId } = useActiveWeb3React()

    return (
        <ConfirmOrLoadingWrapper>
            <RowBetween>
                <div />
                <CloseIcon onClick={onDismiss} />
            </RowBetween>
            <ConfirmedIcon>
                <ArrowUpCircle strokeWidth={0.5} size={90} color={theme && theme.primary1} />
            </ConfirmedIcon>
            <AutoColumn gap="100px" justify={'center'}>
                {children}
                {chainId && hash && (
                    <ExternalLink href={getExplorerLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
                        <TYPE.subHeader>{i18n._(t`View transaction on explorer`)}</TYPE.subHeader>
                    </ExternalLink>
                )}
            </AutoColumn>
        </ConfirmOrLoadingWrapper>
    )
}
