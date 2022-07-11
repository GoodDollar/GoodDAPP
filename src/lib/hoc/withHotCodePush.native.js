import codePush from 'react-native-code-push' // eslint-disable-line import/default
import { t } from '@lingui/macro'

const { CheckFrequency, InstallMode } = codePush

const defaultOptions = {
  checkFrequency: CheckFrequency.MANUAL,
  mandatoryInstallMode: InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: t`A new update is available!`,
  },
}

const withHotCodePush = (component, options = defaultOptions) => codePush(options)(component)

export default withHotCodePush
