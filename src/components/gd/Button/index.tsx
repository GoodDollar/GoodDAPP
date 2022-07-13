import styled from 'styled-components'

export const ButtonAction = styled.button<{
    width?: string
    borderRadius?: string
    error?: boolean
    size?: 'default' | 'sm'
    noShadow?: boolean
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${({ size }) => (size === 'sm' ? '32px' : '71px')};
    min-width: ${({ width = '100%' }) => width};
    padding:5px 0px 5px 0px;
    border-radius: ${({ borderRadius = '20px' }) => borderRadius};
    color: ${({ theme }) => theme.color.main};
    background: ${({ theme }) => theme.color.text2};
    box-shadow: ${({ theme, noShadow }) => (noShadow ? 'none' : theme.shadow.button)};
    cursor: pointer;

    font-style: normal;
    font-weight: ${({ size }) => (size === 'sm' ? '500' : '900')};
    font-size: ${({ size }) => (size === 'sm' ? '14px' : '20px')};
    line-height: 16px;
    text-align: center;
    text-transform: capitalize;
    user-select: none;
    transition: background 0.25s;

    :hover {
      background-color: ${({ theme }) => theme.color.text2hover};
      transition: background 0.25s;
    }

    :disabled {
      background-color: ${({ theme }) => theme.color.text2};
        transition: none;
        opacity: 0.5;
        cursor: auto;
    }
`

export const ButtonDefault = styled.button<{
    size?: 'default' | 'sm'
    error?: boolean
    width?: string
    borderRadius?: string
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${({ size }) => (size === 'sm' ? '32px' : '42px')};
    width: ${({ width = '100%' }) => width};
    padding:5px 10px 5px 10px;
    border-radius: ${({ borderRadius = '12px' }) => borderRadius};
    color: ${({ theme }) => theme.color.main};

    svg {
        color: ${({ theme }) => theme.color.main};
    }

    background: ${({ theme }) => theme.color.text2};
    cursor: pointer;

    font-style: normal;
    font-weight: 500;
    font-size: ${({ size }) => (size === 'sm' ? '14px' : '16px')};
    line-height: 16px;
    text-align: center;
    user-select: none;
    transition: background 0.25s;

    :disabled {
        opacity: 0.5;
        cursor: auto;
    }

    :hover {
      background: ${({ theme }) => theme.color.text2hover};  
      transition: background 0.25s;
    }
    @media ${({ theme }) => theme.media.md} {
        font-size: 12px;
        line-height: 14px;
        height: ${({ size }) => (size === 'sm' ? '26px' : '26px')};
        border-radius: 6px;
        width: auto;
        display: block;
    }
`

export const ButtonOutlined = styled.button<{
    size?: 'default' | 'sm'
    error?: boolean
    width?: string
    borderRadius?: string
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${({ size }) => (size === 'sm' ? '32px' : '42px')};
    width: ${({ width = '100%' }) => width};
    padding:5px 10px 5px 10px;
    border-radius: ${({ borderRadius = '6px' }) => borderRadius};
    color: ${({ theme }) => theme.color.text2};
    background: transparent;
    border: 1px solid ${({ theme }) => theme.color.text2};
    cursor: pointer;

    font-style: normal;
    font-weight: 500;
    font-size: ${({ size }) => (size === 'sm' ? '14px' : '16px')};
    line-height: 16px;
    text-align: center;
    user-select: none;

    :disabled {
        opacity: 0.5;
        cursor: auto;
    }
    @media ${({ theme }) => theme.media.md} {
        font-size: 12px;
        line-height: 14px;
        border-radius: 6px;
        width: auto;
        display: block;
    }
`

export const ButtonText = styled.button<{
    size?: 'default' | 'sm'
    error?: boolean
    width?: string
    borderRadius?: string
}>`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${({ size }) => (size === 'sm' ? '32px' : '42px')};
    width: ${({ width = '100%' }) => width};
    border-radius: ${({ borderRadius = '12px' }) => borderRadius};
    color: ${({ theme }) => theme.color.text2};
    background: none;
    cursor: pointer;

    font-style: normal;
    font-weight: 900;
    font-size: ${({ size }) => (size === 'sm' ? '14px' : '16px')};
    line-height: 16px;
    text-align: center;
    user-select: none;

    :disabled {
        opacity: 0.5;
        cursor: auto;
    }

    @media ${({ theme }) => theme.media.md} {
        font-size: 12px;
        line-height: 14px;
        height: ${({ size }) => (size === 'sm' ? '26px' : '26px')};
        border-radius: 6px;
        width: auto;
        display: block;
    }
`
