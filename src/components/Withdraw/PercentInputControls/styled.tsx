import styled from 'styled-components'

export const PercentInputControlsStyled = styled.div`
    label {
        color: ${({ theme }) => theme.color.text4};
        font-size: 14px;
        font-weight: 500;
    }

    .percent-input {
        color: ${({ theme }) => theme.color.input};
        width: 76px;
        border: 1px solid ${({ theme }) => theme.color.border5};
        border-radius: 6px;
        height: 32px;
        text-align: right;
        font-size: 18px;
        padding-right: 4px;

        &:disabled {
            opacity: 0.5;
            cursor: auto;
        }
    }

    .percent-button {
        padding: 0;
        color: ${({ theme }) => theme.color.text2};
        max-width: 95px;
        height: 32px;
        border: 1px solid ${({ theme }) => theme.color.text2};
        border-radius: 6px;
    }

    .percent-button:focus {
        text-decoration: none;
    }

    .percent-button.active {
        color: ${({ theme }) => theme.color.button2};
        background-color: ${({ theme }) => theme.color.text2};
    }

    input[type='range'] {
        -webkit-appearance: none;
        width: 100%;
        background: transparent;

        &:disabled {
            opacity: 0.5;
            cursor: auto;
        }
    }

    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
    }

    input[type='range']:focus {
        outline: none;
    }

    input[type='range']::-ms-track {
        width: 100%;
        cursor: pointer;

        background: transparent;
        border-color: transparent;
        color: transparent;
    }

    /* Special styling for WebKit/Blink */
    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 18px;
        width: 18px;
        border-radius: 50%;
        background: ${({ theme }) => theme.color.text2};
        cursor: pointer;
        margin-top: -6px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
    }

    /*Firefox*/
    input[type='range']::-moz-range-thumb {
        -webkit-appearance: none;
        height: 18px;
        width: 18px;
        border-radius: 50%;
        border: none;
        background: ${({ theme }) => theme.color.text2};
        cursor: pointer;
    }
    /*IE*/
    input[type='range']::-ms-thumb {
        -webkit-appearance: none;
        height: 18px;
        width: 18px;
        border-radius: 50%;
        background: ${({ theme }) => theme.color.text2};
        cursor: pointer;
    }

    input[type='range']::-webkit-slider-runnable-track {
        width: 100%;
        height: 7px;
        cursor: pointer;
        background: ${({ theme }) => theme.color.rangeTrack};
        border-radius: 6px;
    }

    input[type='range']::-moz-range-track {
        width: 100%;
        height: 7px;
        cursor: pointer;
        background: ${({ theme }) => theme.color.rangeTrack};
        border-radius: 6px;
    }

    input[type='range']::-ms-track {
        width: 100%;
        height: 7px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        border-radius: 6px;
        color: transparent;
    }

    input[type='range']::-ms-fill-lower {
        background: ${({ theme }) => theme.color.rangeTrack};
        border-radius: 6px;
    }

    input[type='range']::-ms-fill-upper {
        background: ${({ theme }) => theme.color.rangeTrack};
        border-radius: 6px;
    }
`
