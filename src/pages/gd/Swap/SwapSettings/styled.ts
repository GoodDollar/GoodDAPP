import styled from 'styled-components'
import { TitleSC } from 'components/gd/Title'

export const SwapSettingsSC = styled.button`
    background: ${({ theme }) => theme.color.bg1};
    box-shadow: ${({ theme }) => theme.shadow.settings};
    border-radius: 12px;
    padding: 5px;

    .icon-wrapper {
        color: ${({ theme }) => theme.color.text2};
        background: ${({ theme }) => theme.color.main};
        border: 1px solid ${({ theme }) => theme.color.text2};
        border-radius: 12px;
        padding: 8px;
    }
`

export const SwapSettingsPopup = styled.div`
    z-index: 2;
    position: absolute;
    top: 70px;
    right: 9px;
    max-width: calc(100% - 18px);
    width: 372px;
    padding: 16px 19px 24px 16px;
    background: ${({ theme }) => theme.color.main};
    box-shadow: ${({ theme }) => theme.shadow.swapCard};
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.color.border4};

    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 19px;
    color: ${({ theme }) => theme.color.text4};

    input[type] {
        font-style: normal;
        font-weight: normal;
        font-size: 18px;
        line-height: 21px;
        color: ${({ theme }) => theme.color.text4};
        padding: 5px 7px 6px;
        text-align: right;
        background: ${({ theme }) => theme.color.main};
        border: 1px solid ${({ theme }) => theme.color.text5};
        border-radius: 6px;
    }

    ${TitleSC}.field {
        margin-bottom: 10px;
    }

    @media ${({ theme }) => theme.media.md} {
        span.field {
            display: none;
        }
    }
`

export const SwapSettingsButton = styled.button<{ $active?: boolean }>`
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;
    color: ${({ theme, $active }) => ($active ? theme.color.main : theme.color.text2)};
    padding: 5px 8px 6px 9px;
    background: ${({ theme, $active }) => ($active ? theme.color.text2 : theme.color.main)};
    border: 1px solid ${({ theme }) => theme.color.text2};
    border-radius: 6px;
`
