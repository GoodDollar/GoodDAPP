import styled from 'styled-components'

export const SwapDescriptionsSC = styled.div`
    position: absolute;
    right: -25px;
    top: 0;
    transform: translateX(100%);

    .block {
        padding: 16px;
        background-color: ${({ theme }) => theme.color.main};
        box-shadow: ${({ theme }) => theme.shadow.swapCard};
        border-radius: 20px;
        width: 230px;
        min-height: 200px;
        margin-top: 22px;

        font-style: normal;
        line-height: 1.1;

        &:first-child {
            margin-top: unset;
        }
    }

    .title {
        font-size: 16px;
        color: ${({ theme }) => theme.color.switch};
        font-weight: bold;
    }

    .description {
        font-size: 14px;
        color: ${({ theme }) => theme.color.text1};
        font-weight: 500;
    }

    @media screen and (min-height: 720px) and (max-width: 1350px),
        screen and (max-height: 720px) and (max-width: 1160px) {
        position: static;
        transform: none;
        display: flex;
        margin-top: 22px;
        margin-bottom: 16px;

        .block {
            margin-top: unset;
            margin-right: 22px;

            &:last-child {
                margin-right: unset;
            }
        }
    }

    @media ${({ theme }) => theme.media.md} {
        .block {
            width: auto;
            flex-grow: 1;
            margin-right: 8px;
            margin-left: 8px;

            &:first-child {
                margin-left: unset;
            }

            &:last-child {
                margin-right: unset;
            }
        }
    }
`
