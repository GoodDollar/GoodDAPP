import styled from 'styled-components'

export const StyledMenuButton = styled.button`
    position: relative;
    width: 100%;
    border: none;
    margin: 0;
    padding: 5px;
    background: ${({ theme }) => theme.color.bg1};
    border-radius: 12px;
    :hover,
    :focus {
        cursor: pointer;
        outline: none;
    }
    .wrapper {
        border: 1px solid ${({ theme }) => theme.color.text2};
        border-radius: 12px;
        padding: 8px;
    }

    svg * {
        fill: ${({ theme }) => theme.color.text2};
    }
`

export const StyledMenu = styled.div`
    // margin-left: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: none;
    text-align: left;
    ${({ theme }) => theme.mediaWidth.upToExtra2Small`
    margin-left: 0.2rem;
  `};
`

export const MenuFlyout = styled.span`
    min-width: 8.125rem;
    background-color: ${({ theme }) => theme.color.main};
    box-shadow: ${({ theme }) => theme.shadow.swapCard};
    border-radius: 20px;
    padding: 16px 18px 32px 16px;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: -400px;
    right: -162px;
    z-index: 100;
    color: ${({ theme }) => theme.color.input};
    font-size: 16px;
    line-height: 19px;
`
