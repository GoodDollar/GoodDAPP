import styled from 'styled-components'

export const SwapConfirmModalSC = styled.div`
    padding: 13px 38px 20px 30px;
    .description {
        font-style: italic;
        font-weight: normal;
        font-size: 14px;
        line-height: 16px;
        color: ${({ theme }) => theme.color.text4};
    }

    .diagram {
        display: grid;
        gap: 6px 18px;
        grid-template-columns: 54px auto auto;
        grid-template-rows: 54px auto 54px;
        align-items: center;

        .direction {
            grid-column: 1 / -1;
            padding-left: 8px;
        }

        .value {
            font-style: normal;
            font-weight: normal;
            font-size: 24px;
            line-height: 28px;
            color: ${({ theme }) => theme.color.input};
        }

        .symbol {
            justify-self: end;
            font-style: normal;
            font-weight: bold;
            font-size: 24px;
            line-height: 32px;
            color: ${({ theme }) => theme.color.text6};
        }
    }
`
