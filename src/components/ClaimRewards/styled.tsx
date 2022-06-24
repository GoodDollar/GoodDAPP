import styled from 'styled-components'

export const ClaimRewardsStyled = styled.div`
    padding: 40px;

    .title {
        font-style: normal;
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        text-align: center;
        color: #0D182D;
    }


    .withdraw {
        font-size: 20px;
        height: 71px;
        max-width: 387px;
    }

    .claiming-hint {
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        color: #8499BB;
        margin-top: 8px;
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

    .details-row {
        color: ${({ theme }) => theme.color.text5};
        font-weight: 700;
        font-size: 14px;
        line-height: 23px;
        letter-spacing: 0.35px;
        text-transform: uppercase;
    }
`
