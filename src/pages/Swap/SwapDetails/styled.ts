import styled from 'styled-components'

export const SwapDetailsSC = styled.div<{ $open?: boolean }>`
    background: ${({ theme }) => theme.color.bg1};
    box-shadow: ${({ theme }) => theme.shadow.swapFooter};
    border-radius: 0px 0px 6px 6px;
    padding: 21px 20px 16px;
    margin-left: 10px;
    margin-right: 10px;
    transform: translateY(${({ $open }) => ($open ? '-11px' : '-100%')});
    position: relative;
    z-index: 1;
    opacity: ${({ $open }) => ($open ? '1' : '0')};
    transition: opacity 0.4s ease, transform 0.6s ease;
    display: ${({ $open }) => ($open ? 'block' : 'none')};
`
