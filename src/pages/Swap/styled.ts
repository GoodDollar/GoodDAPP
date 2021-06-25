import styled from 'styled-components'

export const SwapWrapper = styled.div`
    background: ${({ theme }) => theme.color.main};
    max-width: 712px;
    box-shadow: ${({ theme }) => theme.shadow.swapCard};

    .initial-info div {
        color: ${({ theme }) => theme.color.text5};
        text-transform: uppercase;
        font-weight: bold;
        font-size: 14px;
        letter-spacing: 0.35px;
    }
`
