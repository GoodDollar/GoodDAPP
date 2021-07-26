import styled from 'styled-components'

export const StakeDepositSC = styled.div`
    .walletNotice {
        font-style: italic;
        font-weight: normal;
        font-size: 12px;
        line-height: 14px;
        text-align: center;
        color: ${({ theme }) => theme.color.text1};
    }

    .amount {
        font-weight: bold;
        font-size: 14px;
        line-height: 166%;
        letter-spacing: 0.35px;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text5};
    }

    .token {
        font-style: normal;
        font-weight: normal;
        font-size: 24px;
        line-height: 28px;
        color: ${({ theme }) => theme.color.input};
    }

    .dollar-equivalent {
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        line-height: 166%;
        letter-spacing: 0.35px;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text5};
    }

    .error {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.35px;
        color: #ff0000;
    }
`
