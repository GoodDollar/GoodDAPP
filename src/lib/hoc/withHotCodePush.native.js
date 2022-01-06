let codePush = require('react-native-code-push').default

const defaultOptions = { checkFrequency: CheckFrequency.MANUAL }

const withHotCodePush = (component, options = defaultOptions) => codePush(options)(component)

export default withHotCodePush
