import React from 'react'
import { CheckCircle, Copy } from 'react-feather'
import styled from 'styled-components'
import useCopyClipboard from '../../hooks/useCopyClipboard'
import { LinkStyledButton } from '../../theme'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const CopyIcon = styled(LinkStyledButton)`
    color: ${({ theme }) => theme.text3};
    flex-shrink: 0;
    display: flex;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    text-decoration-line: underline;
    color: ${({ theme }) => theme.color.text2};
`
const TransactionStatusText = styled.span`
    margin-left: 0.25rem;
    font-size: 0.825rem;
    ${({ theme }) => theme.flexRowNoWrap};
    align-items: center;
`

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }): any {
    const { i18n } = useLingui()
    const [isCopied, setCopied] = useCopyClipboard()

    return <CopyIcon onClick={() => setCopied(props.toCopy)}>{isCopied ? i18n._(t`Copied`) : props.children}</CopyIcon>
}
