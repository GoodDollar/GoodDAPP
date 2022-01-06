import codePush, { CheckFrequency } from 'react-native-code-push'

const defaultOptions = { checkFrequency: CheckFrequency.MANUAL }

const withHotCodePush = (component, options = defaultOptions) => codePush(options)(component)

export default withHotCodePush
