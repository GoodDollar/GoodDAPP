import styled from 'styled-components'
import Card from '../../components/gd/Card'

export const SwapCardSC = styled.div`
    max-width: 712px;
    align-self: stretch;

    margin-left: 5rem;

    @media ${({ theme }) => theme.media.md} {
        margin-left: 0;
    }

    .switch {
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
`
