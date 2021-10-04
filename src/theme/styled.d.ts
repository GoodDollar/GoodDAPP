import { theme } from './theme'
import 'styled-components'

type Theme = ReturnType<typeof theme>

declare module 'styled-components' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface DefaultTheme extends Theme {}
}
