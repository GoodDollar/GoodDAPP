import React, { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import Loader from '../Loader'
import { useLingui } from '@lingui/react'
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
    const { active: networkActive, error: networkError } = useActiveWeb3React()
    const { tried } = useOnboardConnect() 
    // handle delayed loader state
    const [showLoader, setShowLoader] = useState(false)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowLoader(true)
        }, 600)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

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
