import styled from 'styled-components'

export const ClaimRewardsStyled = styled.div`
    padding: 16px;

    .title {
        font-style: normal;
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        text-align: center;
        color: ${({ theme }) => theme.color.text1};
        margin-bottom: 12px;
    }

    .claim {
        height: 48px;
        max-width: 288px;
        background: #0075ff;
        text-transform: uppercase;
        font-style: normal;
        font-weight: 700;
        font-size: 14px;
        line-height: 24px;
        border-radius: 8px;
    }

    .claiming-hint {
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        color: #8499bb;
        margin-top: 8px;
        margin-bottom: 0px;
    }

    .pending-hint {
        position: absolute;
        font-size: 12px;
        line-height: 14px;
        bottom: -130px;
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

    .availableRewards {
        font-style: normal;
        font-weight: 700;
        font-size: 12px;
        line-height: 16px;
        color: #8499bb;
        margin-top: 16px;
    }
`
