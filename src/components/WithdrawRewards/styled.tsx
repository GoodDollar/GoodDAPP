import styled from 'styled-components'

export const WithdrawRewardsStyled = styled.div`
    padding: 11px 17px 33px 24px;

    .warning {
        font-size: 14px;
        font-weight: bold;
        line-height: 20px;
        letter-spacing: 0.35px;
        color: ${({ theme }) => theme.red4};
        padding: 20px 0 20px 0;
    }

    .claim-reward {
        font-size: 20px;
        height: 71px;
        max-width: 387px;
    }

    .pending-hint {
        position: absolute;
        font-size: 12px;
        line-height: 14px;
        bottom: -18px;
    }

    .back-to-portfolio {
        text-decoration: none;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text2};
        font-weight: 900;
        font-size: 16px;
        line-height: 16px;
    }
`
