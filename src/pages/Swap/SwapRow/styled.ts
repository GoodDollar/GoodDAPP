import styled from 'styled-components'

export const SwapRowSC = styled.div`
    padding: 20px 20px 21px 14px;
    background: ${({ theme }) => theme.color.main};
    border: 1px solid ${({ theme }) => theme.color.border2};
    box-sizing: border-box;
    border-radius: 12px;

    .title {
        font-weight: 900;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.1px;
        color: ${({ theme }) => theme.color.text5};
    }

    display: flex;
    justify-content: space-between;

    .select {
        flex-shrink: 0;
        margin-right: 30px;
    }

    .input {
        flex-grow: 1;
        max-width: 400px;
    }

    @media ${({ theme }) => theme.media.md} {
        display: block;
        .input {
            margin-top: 10px;
        }
    }
`

export const SwapRowIconSC = styled.div`
    width: 54px;
    height: 54px;
`

export const SwapRowCurrencySC = styled.div`
    span {
        font-weight: bold;
        font-size: 24px;
        line-height: 32px;
        color: ${({ theme }) => theme.color.text6};
    }

    svg {
        color: ${({ theme }) => theme.color.switch};
    }
`
