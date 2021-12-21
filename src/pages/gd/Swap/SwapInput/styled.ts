import styled from 'styled-components'

export const SwapInputSC = styled.div`
    background: ${({ theme }) => theme.color.main};
    border: 1px solid ${({ theme }) => theme.color.text2};
    box-sizing: border-box;
    border-radius: 6px;
    height: 60px;
    padding: 0 12px 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    input {
        flex-grow: 1;
        font-style: normal;
        font-weight: normal;
        font-size: 24px;
        line-height: 28px;
        color: ${({ theme }) => theme.color.input};
        padding: 0;
        border: none;
    }
`

export const SwapInputMaxButton = styled.button`
    font-weight: 900;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    color: ${({ theme }) => (theme.darkMode ? theme.color.text1 : theme.color.text5)};
    border: 1px solid ${({ theme }) => (theme.darkMode ? theme.color.text1 : theme.color.text5)};
    border-radius: 46px;
    padding: 4px 10px;

    margin-right: 9px;
    flex-shrink: 0;
`

export const SwapInputBalance = styled.div`
    font-weight: normal;
    font-size: 12px;
    line-height: 14px;
    text-align: right;
    color: ${({ theme }) => theme.color.input};

    margin-left: 8px;
    flex-shrink: 0;
`
