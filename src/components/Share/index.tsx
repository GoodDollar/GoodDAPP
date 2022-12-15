import React, { useState, memo } from 'react'

import { LinkedinIcon, FacebookIcon, TwitterIcon, CopyIcon } from '../Icon'
import Row from 'components/Row'
import Title from 'components/gd/Title'

import styled from 'styled-components'

import { FacebookShareButton, LinkedinShareButton, TwitterShareButton } from 'react-share'
import { ButtonOutlined } from 'components/gd/Button'

export interface ShareProps {
    show?: boolean
    title?: string
    copyText?: string
    facebook?: {
        url: string
        quote?: string
        hashtag?: string
        [prop: string]: any
    }
    twitter?: {
        url: string
        title?: string
        via?: string
        hashtags?: string[]
        [prop: string]: any
    }
    linkedin?: {
        url: string
        title?: string
        summary?: string
        source?: string
        [prop: string]: any
    }
}

export const ShareSC = styled.div<{ textCopied: boolean }>`
    .title {
        color: ${({ theme }) => theme.color.text5};
        font-size: 16px;
        line-height: 24px;
    }
    .shareButton {
        svg {
            transition: 0.3s ease opacity;
        }
        &:active svg,
        &:hover:not(:active) svg {
            opacity: 0.75;
        }
    }
    .copyButton {
        width: auto;
        border-color: ${({ theme, textCopied }) => (textCopied ? theme.color.text2 : theme.color.text1)};
        fill: ${({ theme, textCopied }) => (textCopied ? theme.color.text2 : theme.darkMode ? theme.white : '#081C3E')};
    }
`

export const Share = memo(({ show = true, title, copyText, ...rest }: ShareProps): React.ReactElement | null => {
    const [textCopied, textCopiedSet] = useState(false)

    const copy = () => {
        if (textCopied) return
        void navigator.clipboard.writeText(copyText || '')

        textCopiedSet(true)
        setTimeout(() => textCopiedSet(false), 500)
    }

    if (!show) return null

    const { twitter, facebook, linkedin } = rest

    return (
        <ShareSC className="p-3.5" textCopied={textCopied}>
            {title && (
                <Row align="center" justify="center">
                    <Title className="mb-2 font-bold title">{title}</Title>
                </Row>
            )}
            <Row align="center" justify="center" gap="24px">
                {linkedin && (
                    <LinkedinShareButton className="shareButton" {...linkedin}>
                        <LinkedinIcon height="32px" />
                    </LinkedinShareButton>
                )}
                {twitter && (
                    <TwitterShareButton className="shareButton" {...twitter}>
                        <TwitterIcon height="26px" />
                    </TwitterShareButton>
                )}
                {facebook && (
                    <FacebookShareButton className="shareButton" {...facebook}>
                        <FacebookIcon height="32px" />
                    </FacebookShareButton>
                )}
                {copyText && (
                    <ButtonOutlined onClick={copy} className="pl-3 pr-3 copyButton" disabled={textCopied}>
                        <CopyIcon height="24px" />
                    </ButtonOutlined>
                )}
            </Row>
        </ShareSC>
    )
})

export default Share
