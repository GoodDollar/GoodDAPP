import React from 'react'
import styled from 'styled-components'
import { ExternalLink } from '../../theme'

const InfoCard = styled.button<{ active?: boolean }>`
    padding: 1rem;
    outline: none;
    border-radius: 6px;
    width: 100% !important;
    border: 1px solid ${({ theme, active }) => (active ? theme.color.switch : 'transparent')};
`

const OptionCard = styled(InfoCard as any)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 2rem;
    padding: 1rem;
`

const OptionCardLeft = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap};
    justify-content: center;
    height: 100%;
`

const OptionCardClickable = styled(OptionCard as any)<{ clickable?: boolean }>`
    margin-top: 0;
    &:hover {
        cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};
        background: ${({ theme }) => theme.color.hover};
    }
    opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

const HeaderText = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 21px;
    color: ${({ theme }) => theme.color.text7};
`

const SubHeader = styled.div`
    color: ${({ theme }) => theme.text1};
    margin-top: 10px;
    font-size: 12px;
`

const IconWrapper = styled.div<{ size?: number | null }>`
    ${({ theme }) => theme.flexColumnNoWrap};
    margin-right: 16px;
    align-items: center;
    justify-content: center;
    & > img,
    span {
        height: ${({ size }) => (size ? size + 'px' : '24px')};
        width: ${({ size }) => (size ? size + 'px' : '24px')};
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

export default function Option({
    link = null,
    clickable = true,
    size,
    onClick = null,
    header,
    subheader = null,
    icon,
    active = false,
    id,
}: {
    link?: string | null
    clickable?: boolean
    size?: number | null
    onClick?: null | (() => void)
    header: React.ReactNode
    subheader: React.ReactNode | null
    icon: string
    active?: boolean
    id: string
    /** @deprecated */
    color?: string
}) {
    const content = (
        <OptionCardClickable
            id={id}
            onClick={clickable ? onClick : undefined}
            clickable={clickable && !active}
            active={active}
        >
            <div className="flex items-center">
                <IconWrapper size={size}>
                    <img src={icon} alt={'Icon'} />
                </IconWrapper>
                <OptionCardLeft>
                    <HeaderText className="flex justify-between flex-grow">{header}</HeaderText>
                    {subheader && <SubHeader>{subheader}</SubHeader>}
                </OptionCardLeft>
            </div>
            {active && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                        fill="#1FC2AF"
                    />
                </svg>
            )}
        </OptionCardClickable>
    )
    if (link) {
        return <ExternalLink href={link}>{content}</ExternalLink>
    }

    return content
}
