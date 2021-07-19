import styled from 'styled-components'

export const SwapInfoSC = styled.div`
    display: flex;
    justify-content: space-between;

    .title,
    .value {
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 1.6;
        letter-spacing: 0.35px;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text5};
    }
`
