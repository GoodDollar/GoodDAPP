import React, { useMemo } from 'react'
import { Text, TextProps } from 'rebass'
import styled, { ThemeProvider as StyledComponentsThemeProvider, css } from 'styled-components'
import { useApplicationTheme } from '../state/application/hooks'

export * from './components'

const MEDIA_WIDTHS = {
    upToExtra2Small: 320,
    upToExtraSmall: 500,
    upToSmall: 720,
    upToMedium: 960,
    upToLarge: 1280,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
    (accumulator, size) => {
        ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
            @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
                ${css(a, b, c)}
            }
        `
        return accumulator
    },
    {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export function colors(darkMode: boolean) {
    return {
        darkMode,
        // base
        white,
        black,

        // text
        text1: darkMode ? '#FFFFFF' : '#000000',
        text2: darkMode ? '#C3C5CB' : '#565A69',
        text3: darkMode ? '#6C7284' : '#888D9B',
        text4: darkMode ? '#565A69' : '#C3C5CB',
        text5: darkMode ? '#2C2F36' : '#EDEEF2',
        text6: '#636363', // add darkmode
        text7: '#A3A3A3',

        // backgrounds / greys
        bg1: darkMode ? '#202231' : '#FFFFFF',
        bg2: darkMode ? 'rgb(22, 21, 34)' : '#F7F8FA',
        bg3: darkMode ? '#2a3a50' : '#EDEEF2',
        bg4: darkMode ? '#3a506f' : '#CED0D9',
        bg5: darkMode ? '#6C7284' : '#888D9B',

        //specialty colors
        modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
        advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

        //primary colors
        primary1: darkMode ? '#0094ec' : '#0e0e23',
        primary2: darkMode ? '#0097fb' : '#FF8CC3',
        primary3: darkMode ? '#00aff5' : '#FF99C9',
        primary4: darkMode ? '#376bad70' : '#F6DDE8',
        primary5: darkMode ? '#153d6f70' : '#ebebeb',

        // color text
        primaryText1: darkMode ? '#6da8ff' : '#0e0e23',

        // secondary colors
        secondary1: darkMode ? '#0094ec' : '#ff007a',
        secondary2: darkMode ? '#17000b26' : '#F6DDE8',
        secondary3: darkMode ? '#17000b26' : '#ebebeb',

        // other
        red1: '#FD4040',
        red2: '#F82D3A',
        red3: '#D60000',
        red4: '#FF0000',
        green1: '#27AE60',
        yellow1: '#FFE270',
        yellow2: '#F3841E',
        blue1: '#0094ec',
        blue2: '#80d8ff',
        blue4: darkMode ? '#153d6f70' : '#C4D9F8',

        borderRadius: '10px',

        // dont wanna forget these blue yet
        // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
        // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
    }
}

export function theme(darkMode: boolean) {
    return {
        ...colors(darkMode),
        color: {
            main: darkMode ? '#151A30' : '#ffffff',
            secondaryBg: darkMode ? '#151A30' : '#F6F8FA',
            mainBg: darkMode ? '#222B45' : '#EDF5FC',
            border1: darkMode ? 'rgba(208, 217, 228, 0.483146)' : 'rgba(208, 217, 228, 0.483146)',
            border2: darkMode ? '#151A30' : '#E5E5E5',
            border3: darkMode ? 'rgba(208,217,228,0.483146)' : '#ccefff',
            border4: darkMode ? '#8F9BB3' : '#ffffff',
            border5: darkMode ? '#8F9BB3' : '#8F9BB3',
            text1: darkMode ? '#FFFFFF' : '#0D182D',
            text2: darkMode ? '#00B0FF' : '#00B0FF',
            text2hover: darkMode ? '#0387c3' : '#0387c3',
            text3: darkMode ? '#A5A5A5' : '#A5A5A5',
            text4: darkMode ? '#FFFFFF' : '#42454A',
            text5: darkMode ? '#8F9BB3' : '#8f9bb3',
            text6: darkMode ? '#FFFFFF' : '#1A1F38',
            text7: darkMode ? '#A3B2BF' : '#4F606F',
            text8: darkMode ? '#F6F8FA' : '#696D73',
            text9: darkMode ? 'rgba(14, 39, 60, 0.7)' : 'rgba(14, 39, 60, 0.7)',
            input: darkMode ? '#FFFFFF' : '#173046',
            button1: darkMode ? '#2E3A59' : 'rgba(0, 176, 255, 0.1)',
            button2: darkMode ? '#173046' : '#FFFFFF',
            bg1: darkMode ? '#1A1F38' : '#f6f8fa',
            bg2: darkMode ? 'rgba(13, 38, 61, 0.4)' : 'rgba(13, 38, 61, 0.4)',
            bgBody: darkMode ? '#1a1f38' : 'white',
            switch: darkMode ? '#1FC2AF' : '#1FC2AF',
            hover: darkMode ? 'rgba(31, 194, 175, 0.3)' : 'rgba(31,194,175,0.1)',
            rangeTrack: darkMode ? '#8F9BB3' : '#F5F5F5',
        },
        shadow: {
            header: '0px 0px 16px rgba(206, 211, 218, 0.33815)',
            headerNew: '0px 1px 1.41px rgba(0, 0, 0, 0.2)',
            wallet: darkMode ? 'none' : '0px 15px 40px rgba(117, 117, 170, 0.102792)',
            // settings: darkMode ? 'none' : '0px 1px 0px #DAE1ED;',
            swapFooter: darkMode ? 'none' : '-1px 2px 0px #DAE1ED',
            button: '3px 3px 10px -1px rgba(11, 27, 102, 0.304824)',
            swapCard: darkMode ? 'none' : '12px 8px 44px -12px rgba(27, 58, 146, 0.16)',
        },
        font: {
            primary: `Roboto, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'`,
            secondary: `'Roboto Slab', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'`,
        },
        media: {
            md: 'screen and (max-width: 975px)',
            lg: 'screen and (min-width: 976px)',
        },
        grids: {
            sm: 8,
            md: 12,
            lg: 24,
        },

        //gradients
        gradient: {
            loadingGradient:
                'linear-gradient(to left, rgba(251,251,251, .05), rgba(251,251,251, .3), rgba(251,251,251, .6), rgba(251,251,251, .3),rgba(251,251,251, .05));',
        },

        //shadows
        shadow1: darkMode ? '#000' : '#2F80ED',

        // media queries
        mediaWidth: mediaWidthTemplates,

        // css snippets
        flexColumnNoWrap: css`
            display: flex;
            flex-flow: column nowrap;
        ` as any,
        flexRowNoWrap: css`
            display: flex;
            flex-flow: row nowrap;
        ` as any,
    }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeName] = useApplicationTheme()

    const themeObject = useMemo(() => theme(themeName === 'dark'), [themeName])

    return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof ReturnType<typeof colors> }>`
    color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
    main(props: TextProps) {
        return <TextWrapper fontWeight={500} color={'text2'} {...props} />
    },
    link(props: TextProps) {
        return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
    },
    black(props: TextProps) {
        return <TextWrapper fontWeight={500} color={'text1'} {...props} />
    },
    white(props: TextProps) {
        return <TextWrapper fontWeight={500} color={'white'} {...props} />
    },
    body(props: TextProps) {
        return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
    },
    mediumHeader(props: TextProps) {
        return <TextWrapper fontWeight={500} fontSize={20} {...props} />
    },
    subHeader(props: TextProps) {
        return <TextWrapper fontWeight={400} fontSize={14} {...props} />
    },
    small(props: TextProps) {
        return <TextWrapper fontWeight={500} fontSize={11} {...props} />
    },
    blue(props: TextProps) {
        return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
    },
    darkGray(props: TextProps) {
        return <TextWrapper fontWeight={500} color={'text3'} {...props} />
    },
    italic(props: TextProps) {
        return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
    },
    error({ error, ...props }: { error: boolean } & TextProps) {
        return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
    },
}
