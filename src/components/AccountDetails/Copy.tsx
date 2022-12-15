import React from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import styled from 'styled-components'
import useCopyClipboard from '../../hooks/useCopyClipboard'
import { LinkStyledButton } from '../../theme'

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

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }): any {
    const { i18n } = useLingui()
    const [isCopied, setCopied] = useCopyClipboard()

    return <CopyIcon onClick={() => setCopied(props.toCopy)}>{isCopied ? i18n._(t`Copied`) : props.children}</CopyIcon>
}
