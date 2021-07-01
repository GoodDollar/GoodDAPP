import styled from 'styled-components'
import { TitleSC } from '../../components/gd/Title'

export const PortfolioSC = styled.div``

export const PortfolioAnalyticSC = styled.div`
    height: 72px;

    ${TitleSC}.category {
        line-height: 14px;
    }
`

export const PortfolioTitleSC = styled.div`
    font-style: normal;
    font-weight: 900;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.1px;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.text6};
`

export const PortfolioValueSC = styled.div`
    font-style: normal;
    font-weight: bold;
    font-size: 24px;
    line-height: 32px;
    color: ${({ theme }) => theme.color.text6};
`
