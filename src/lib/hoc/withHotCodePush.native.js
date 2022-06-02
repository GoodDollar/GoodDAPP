import codePush from 'react-native-code-push' // eslint-disable-line import/default

const { CheckFrequency } = codePush
const defaultOptions = { checkFrequency: CheckFrequency.MANUAL }
const withHotCodePush = (component, options = defaultOptions) => codePush(options)(component)

export default withHotCodePush
