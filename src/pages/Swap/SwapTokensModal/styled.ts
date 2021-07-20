import styled from 'styled-components'

export const SwapTokensModalSC = styled.div`
    padding: 20px 8px 10px 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .list {
        overflow-y: auto;
        padding-right: 8px;
        flex-grow: 1;
    }
`

export const SwapTokensModalSearch = styled.div`
    margin-top: 14px;
    margin-bottom: 28px;
    display: flex;
    padding: 12px 12px 12px 17px;
    background: ${({ theme }) => theme.color.main};
    border: 1px solid ${({ theme }) => theme.color.text5};
    border-radius: 6px;

    input {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 16px;
        color: ${({ theme }) => theme.color.text4};
        padding: 0;
        border: none;
        flex-grow: 1;
    }

    svg {
        color: ${({ theme }) => theme.color.text2};
        margin-left: 12px;
        flex-shrink: 0;
    }
`
