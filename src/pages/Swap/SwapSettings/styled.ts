import styled from 'styled-components'

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
