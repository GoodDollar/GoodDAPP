import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { TYPE } from '../../theme'
import { ExternalLink } from '../../theme/components'
import { getExplorerLink } from '../../utils'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const RowNoFlex = styled(AutoRow)`
    flex-wrap: nowrap;
`

export default function TransactionPopup({
    hash,
    success,
    summary
}: {
    hash: string
    success?: boolean
    summary?: string
}) {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()

    const theme = useTheme()

    return (
        <RowNoFlex>
            <div style={{ paddingRight: 16 }}>
                {success ? (
                    <CheckCircle color={theme && theme.green1} size={24} />
                ) : (
                    <AlertCircle color={theme && theme.red1} size={24} />
                )}
            </div>
            <AutoColumn gap="8px">
                <TYPE.body fontWeight={500}>
                    {summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
                </TYPE.body>
                {chainId && (
                    <ExternalLink href={getExplorerLink(chainId, hash, 'transaction')}>
                        {i18n._(t`View on explorer`)}
                    </ExternalLink>
                )}
            </AutoColumn>
        </RowNoFlex>
    )
}
