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

export const SwapTokensModalRow = styled.div`
    cursor: pointer;
    margin-bottom: 24px;
    &:last-child {
        margin-bottom: 0;
    }

    display: grid;
    grid-template-columns: 32px auto auto;
    grid-template-rows: 21px 19px;
    grid-gap: 4px 17px;
    grid-template-areas:
        'icon title balance'
        'icon subtitle balance';

    align-items: center;

    .icon {
        grid-area: icon;
    }
    .title {
        grid-area: title;
        font-weight: normal;
        font-size: 18px;
        line-height: 21px;
        color: ${({ theme }) => theme.color.text9};
    }
    .subtitle {
        grid-area: subtitle;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: ${({ theme }) => theme.color.text1};
    }
    .balance {
        grid-area: balance;
        font-weight: normal;
        font-size: 12px;
        line-height: 14px;
        text-align: right;
        color: ${({ theme }) => theme.color.input};
    }

    .title,
    .subtitle,
    .balance {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`
