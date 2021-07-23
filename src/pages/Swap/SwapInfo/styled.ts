import styled from 'styled-components'

export const SwapInfoSC = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        margin-right: 1rem;
    }

    .title,
    .value {
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 1.6;
        letter-spacing: 0.35px;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text5};
        white-space: nowrap;

        @media ${({ theme }) => theme.media.md} {
            font-size: 11px;
            line-height: 1.4;
        }
    }
`
