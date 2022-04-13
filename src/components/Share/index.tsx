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
    show: boolean
    title?: string
    twitter?: boolean
    facebook?: boolean
    linkedin?: boolean
    postData: SocialProps
}

export const ShareSC = styled.div`
    .title {
        color: ${({ theme }) => theme.color.text5};
        font-size: 16px;
        line-height: 24px;
    }
`

export const Share = ({ show = true, title, ...rest }: ShareProps): React.ReactElement | null => {
    if (!show) return null

    const { twitter, facebook, linkedin, postData } = rest

    return (
        <ShareSC className="p-3.5">
            {title && (
                <Row align="center" justify="center">
                    <Title className="title mb-2 font-bold">{title}</Title>
                    {/* <span className=""></span> */}
                </Row>
            )}
            <Row align="center" justify="center" gap="24px">
                {linkedin && (
                    <LinkedinShareButton {...postData}>
                        <LinkedinIcon height={32} />
                    </LinkedinShareButton>
                )}
                {twitter && (
                    <TwitterShareButton {...postData}>
                        <TwitterIcon height={26} />
                    </TwitterShareButton>
                )}
                {facebook && (
                    <FacebookShareButton {...postData}>
                        <FacebookIcon height={32} />
                    </FacebookShareButton>
                )}
            </Row>
        </ShareSC>
    )
}

export default React.memo(Share)
