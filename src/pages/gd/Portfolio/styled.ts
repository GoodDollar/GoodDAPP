import styled from 'styled-components'
import { TitleSC } from 'components/gd/Title'
import { ButtonDefault } from 'components/gd/Button'
import { TableSC } from 'components/gd/Table'

export const CellSC = styled.div`
    display: grid;
    grid-gap: 17px;
    grid-template-areas:
        't t'
        'a b'
        'c d'
        'e e'
        'f f';

    .part {
        display: flex;
        flex-direction: column;
    }

    .key {
        text-transform: capitalize;
        font-size: 10px;
        line-height: 14px;
        font-weight: 500;
    }

    .value {
        font-size: 12px;
        line-height: 14px;
        font-weight: bold;
    }

    .token {
        grid-area: t;
        font-size: 18px;
        line-height: 24px;
    }

    .protocol {
        grid-area: a;
    }

    .multiplier {
        grid-area: b;
    }

    .grewards {
        grid-area: c;
    }

    .goodrewards {
        grid-area: d;
    }

    .stake {
        grid-area: e;
    }

    .withdraw {
        display: flex;
        flex-wrap: nowrap;
        gap: 8px;
        grid-area: f;
    }
`

export const PortfolioTitleSC = styled.div`
    font-style: normal;
    font-weight: 900;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.1px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.text6};

    @media ${({ theme }) => theme.media.md} {
        font-size: 12px;
        line-height: 24px;

        &.claimable-rewards {
            margin-bottom: 10px;
            br {
                display: none;
            }
        }
    }

    @media screen and (max-width: 768px) {
        font-size: 16px;
        line-height: 16px;
    }
`

export const PortfolioValueSC = styled.div`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 1;
    color: ${({ theme }) => theme.color.text6};
    margin-top: 0.6em;

    white-space: nowrap;

    @media screen and (max-width: 1199px) {
        font-size: 16px;
    }

    @media ${({ theme }) => theme.media.md} {
        font-size: 16px;
        margin-bottom: 10px;
    }

    @media screen and (max-width: 768px) {
        margin: 2px 0 0;
    }
`

export const PortfolioAnalyticSC = styled.div`
    height: 72px;

    ${TitleSC}.category {
        line-height: 14px;
    }

    > * {
        padding-left: 5px;
        padding-right: 5px;
        flex-basis: 22%;
        flex-grow: 1;

        &:nth-child(2) {
            flex-basis: 29%;
        }

        &:first-child {
            padding-left: 0;
        }

        &:last-child {
            padding-right: 0;
        }
    }

    @media ${({ theme }) => theme.media.md} {
        flex-wrap: wrap;
        flex-direction: column;
        height: unset;

        > * {
            width: 100%;
        }

        ${ButtonDefault} {
            width: 100%;
        }

        .segment {
            padding: 0;
        }

        .social-contribution {
            width: 100%;
        }

        ${TitleSC}.category {
            line-height: 24px;
        }
    }
`

export const PortfolioSC = styled.div`
    th {
        text-align: left;
    }

    .comingSoon {
        background: ${({ theme }) => theme.color.bg2};
        border-radius: 6px;
        color: ${({ theme }) => theme.color.main};
        font-weight: bold;
        font-size: 14px;
        line-height: 166%;
        letter-spacing: 0.35px;
        text-transform: uppercase;
        text-align: center;
        padding: 11px 11px 12px 11px;
        margin-top: 5px;
        user-select: none;
        max-width: 229px;
        white-space: nowrap;
    }

    .social-contribution {
        ${TitleSC}.category {
            font-size: 12px;
        }
    }

    @media screen and (max-width: 1250px) {
        ${TableSC} {
            th:nth-child(3),
            td:nth-child(3) {
                display: none;
            }
        }
    }

    @media screen and (max-width: 1170px) {
        ${TableSC} {
            th:nth-child(5),
            td:nth-child(5),
            th:nth-child(6),
            td:nth-child(6) {
                display: none;
            }
        }
    }

    @media screen and (max-width: 768px) {
        .segment:not(:first-child) {
            margin-top: 16px;
        }

        .card {
            padding: 14px;

            & > div {
                padding: 8px;
            }
        }

        .withdraw-buttons {
            gap: 4px;

            .withdraw-button {
                flex-grow: 1;
                min-height: 32px;
            }

            ${ButtonDefault} {
                height: auto;
            }
        }

        .actionButton {
            font-size: 16px;
            line-height: 16px;
        }
    }

    @media ${({ theme }) => theme.media.md} {
        ${TableSC} ${TitleSC} {
            font-size: 10px;
        }

        ${TableSC} {
            th:nth-child(1),
            td:nth-child(1),
            th:nth-child(8),
            td:nth-child(8) {
                display: none;
            }

            td:nth-child(2) {
                border-left: 1px solid ${({ theme }) => theme.color.border2};
                border-top-left-radius: 12px;
            }

            td:nth-child(7) {
                border-right: 1px solid ${({ theme }) => theme.color.border2};
                border-top-right-radius: 12px;
            }

            tr.mobile ${ButtonDefault} {
                width: 100%;
            }
        }
    }
`
