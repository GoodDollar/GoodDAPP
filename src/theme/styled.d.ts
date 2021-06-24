import { theme } from './theme'
import 'styled-components'

type Theme = ReturnType<typeof theme>

declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}
