import * as React from 'react'

import { LinkedinIcon, FacebookIcon, TwitterIcon } from '../Icon'
import Row from 'components/Row'
import Title from 'components/gd/Title'

import styled from 'styled-components'

import { FacebookShareButton, LinkedinShareButton, TwitterShareButton } from 'react-share'

interface SocialProps {
    url: string
    [prop: string]: string | string[]
}

export interface ShareProps {
    show?: boolean
    title?: string
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

export const ShareSC = styled.div`
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
`

export const Share = ({ show = true, title, ...rest }: ShareProps): React.ReactElement | null => {
    if (!show) return null

    const { twitter, facebook, linkedin } = rest

    return (
        <ShareSC className="p-3.5">
            {title && (
                <Row align="center" justify="center">
                    <Title className="title mb-2 font-bold">{title}</Title>
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
            </Row>
        </ShareSC>
    )
}

export default React.memo(Share)
