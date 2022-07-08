import codePush from 'react-native-code-push' // eslint-disable-line import/default

const { CheckFrequency, InstallMode } = codePush
const defaultOptions = {
  checkFrequency: CheckFrequency.ON_APP_RESUME,
  mandatoryInstallMode: InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: 'a new update is available!',
  },
}
const withHotCodePush = (component, options = defaultOptions) => codePush(options)(component)

export default withHotCodePush
