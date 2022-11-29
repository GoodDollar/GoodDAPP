import React, { useEffect, useState } from 'react'
import { useAnalytics } from '@gooddollar/web3sdk-v2/dist/sdk/analytics'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import styled from 'styled-components'

import Loader from '../Loader'
import { useOnboardConnect } from 'hooks/useActiveOnboard'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const MessageWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20rem;
`

const Message = styled.h2`
    color: ${({ theme }) => theme.secondary1};
`

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
    const { i18n } = useLingui()
    const { tried } = useOnboardConnect()
    const [showLoader, setShowLoader] = useState(false) // handle delayed loader state
    const { active: networkActive, error: networkError, account } = useActiveWeb3React()
    const { identify } = useAnalytics()

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowLoader(true)
        }, 600)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

    useEffect(() => {
        // re-identify analytics when connected wallet changes
        if (networkActive && account) {
            identify(account)
        }
    }, [networkActive, account])

    // on page load, do nothing until we've tried to connect a previously connected wallet
    if (!tried) {
        return showLoader ? (
            <MessageWrapper>
                <Loader />
            </MessageWrapper>
        ) : null
    }

    // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
    if (!networkActive && networkError) {
        return (
            <MessageWrapper>
                <Message>
                    {i18n._(
                        t`Oops! An unknown error occurred. Please refresh the page, or visit from another browser or device`
                    )}
                </Message>
            </MessageWrapper>
        )
    }

    return children
}
