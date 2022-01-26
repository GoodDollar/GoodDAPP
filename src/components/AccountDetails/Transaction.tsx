import React from 'react'
import { CheckCircle, Triangle } from 'react-feather'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useAllTransactions } from '../../state/transactions/hooks'
import { ExternalLink } from '../../theme'
import { getExplorerLink } from '../../utils'
import Loader from '../Loader'
import { RowFixed } from '../Row'

const TransactionWrapper = styled.div``

const TransactionStatusText = styled.div`
    white-space: nowrap;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
    &:first-child {
        margin-right: 0;
        overflow: hidden;
        span {
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
`

const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none !important;
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: 0.25rem 0rem;
    font-weight: 500;
    font-size: 0.825rem;
    color: ${({ theme }) => theme.color.text1};

    .transition {
        position: relative;

        &:after {
            content: '';
            display: block;
            position: absolute;
            bottom: 2px;
            left: 0;
            right: 0;
            border-bottom: 1px solid transparent;
        }
        &:hover:after {
            border-bottom: 1px solid ${({ theme }) => theme.color.text1};
        }
    }
`

const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
    color: ${({ pending, success, theme }) => (pending ? theme.primary1 : success ? theme.green1 : theme.red1)};
`

export default function Transaction({ hash }: { hash: string }): any {
    const { chainId } = useActiveWeb3React()
    const allTransactions = useAllTransactions()

    const tx = allTransactions?.[hash]
    const pending = !tx?.receipt
    const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')
    const summary = tx?.summary

    if (!chainId) return null
    // const splitIn = Math.floor(hash.length / 2)

    return (
        <TransactionWrapper>
            <TransactionState href={getExplorerLink(chainId, hash, 'transaction')} pending={pending} success={success}>
                <RowFixed className="transition">
                  <TransactionStatusText>{summary} ↗</TransactionStatusText>
                </RowFixed>
                <IconWrapper pending={pending} success={success}>
                    {pending ? <Loader /> : success ? <CheckCircle size="16" /> : <Triangle size="16" />}
                </IconWrapper>
            </TransactionState>
        </TransactionWrapper>
    )
}
