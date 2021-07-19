import styled from 'styled-components'

export const SwapDetailsSC = styled.div`
    background: ${({ theme }) => theme.color.bg1};
    box-shadow: ${({ theme }) => theme.shadow.swapFooter};
    border-radius: 0px 0px 6px 6px;
    padding: 21px 20px 16px;
    margin-left: 10px;
    margin-right: 10px;
    transform: translateY(-11px);
    position: relative;
    z-index: 1;
`
