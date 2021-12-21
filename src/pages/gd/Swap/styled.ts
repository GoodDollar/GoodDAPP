import styled from 'styled-components'
import Card from 'components/gd/Card'

export const SwapCardSC = styled.div<{ open: boolean }>`
    max-width: 712px;
    align-self: stretch;
    position: relative;

    margin-left: 5rem;

    @media screen and (max-height: 720px) {
        transform-origin: 0 0;
        transform: scale(0.8);
        margin-bottom: -${({ open }) => (open ? 150 : 115)}px;
    }

    @media ${({ theme }) => theme.media.md} {
        transform: none;
        margin-bottom: unset;
        margin-left: 0;
        align-self: center;
        max-width: 100%;
        width: 500px;
    }

    .switch {
        user-select: none;
        position: relative;
        svg {
            color: ${({ theme }) => theme.color.main};
            position: absolute;
            top: 0;
            left: 14px;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
`

export const SwapWrapperSC = styled.div`
    padding: 15px 9px 25px 17px;
    background: ${({ theme }) => theme.color.main};
    box-shadow: ${({ theme }) => theme.shadow.swapCard};
    border-radius: 20px;
    position: relative;
    z-index: 2;
`

export const SwapContentWrapperSC = styled(Card).attrs(() => ({
    contentWrapped: false
}))`
    margin-top: 14px;
    padding: 25px 21px 23px;
    display: flex;
    flex-direction: column;

    > *:nth-child(2) {
        order: 2;
    }
    > *:nth-child(4) {
        order: 4;
    }
    > *:nth-child(5) {
        order: 5;
    }
`
