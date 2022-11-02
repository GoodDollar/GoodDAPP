import { t } from '@lingui/macro'

export const GiveUpReason = new class {
  CameraIssue = 'camera'

  OvalIssue = 'oval'

  TwinIssue = 'twin'

  TryAgainIssue = 'tryAgain'

  get reasons() {
    const { CameraIssue, OvalIssue, TwinIssue, TryAgainIssue } = this

    return [CameraIssue, OvalIssue, TwinIssue, TryAgainIssue]
  }

  get reasonsList() {
    return this.reasons.map(reason => ({ reason, text: this.getReasonText(reason) }))
  }

  getReasonText(reason) {
    const { CameraIssue, OvalIssue, TwinIssue, TryAgainIssue } = this

    switch (reason) {
      case CameraIssue:
        return t`Camera issues`
      case OvalIssue:
        return t`Unable to put my face in the Oval`
      case TwinIssue:
        return t`It says I have a twin`
      case TryAgainIssue:
        return t`It keeps asking me to try again`
      default:
        throw new Error('Unknown / invalid reason specified')
    }
  }
}()
