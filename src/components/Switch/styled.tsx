import styled from 'styled-components'

export const StyledSwitch = styled.div<{ checked: boolean }>`
    position: relative;
    width: 36px;
    height: 22px;

    .area {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${({ theme, checked }) => (checked ? theme.color.text2 : theme.color.bg2)};
        border-radius: 12px;
    }
    .toggle {
        position: absolute;
        top: 1px;
        left: 0;
        transform: translateX(1px);
        width: 20px;
        height: 20px;
        background-color: ${({ theme }) => theme.color.main};
        box-shadow: 0 1.375px 1.375px rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        transition: 0.3s;
    }

    input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        opacity: 0;
        border: none;
        z-index: 1;
        cursor: pointer;
    }

    input:checked + .toggle {
        left: 100%;
        transform: translateX(calc(-100% - 1px));
    }
`
