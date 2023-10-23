import { theme as baseTheme } from '@gooddollar/good-design'
import { extendTheme } from 'native-base'

import { navbarTheme as NavBar } from 'components/StyledMenu/Navbar'

const { components } = baseTheme

export const nbTheme = extendTheme({
    ...baseTheme,
    components: {
        ...components,
        NavBar,
    },
})
