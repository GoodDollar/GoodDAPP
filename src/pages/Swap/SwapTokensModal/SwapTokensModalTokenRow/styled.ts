import styled from 'styled-components'

export const SwapTokensModalTokenRowSC = styled.div<{ $active?: boolean }>`
    cursor: ${({ $active }) => ($active ? 'auto' : 'pointer')};
    opacity: ${({ $active }) => ($active ? '0.5' : '1')};
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
        justify-self: end;
    }

    .title,
    .subtitle,
    .balance {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`
