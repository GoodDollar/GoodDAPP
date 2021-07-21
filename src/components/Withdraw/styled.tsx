import styled from 'styled-components'

export const WithdrawStyled = styled.div`
    padding: 11px 17px 33px 24px;

    .withdraw {
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

    .details-row {
        color: ${({ theme }) => theme.color.text5};
        font-weight: 700;
        font-size: 14px;
        line-height: 23px;
        letter-spacing: 0.35px;
        text-transform: uppercase;
    }

    .horizontal {
        border-bottom: 1px solid #e5e5e5;
    }
`
