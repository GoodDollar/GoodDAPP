import { t } from '@lingui/macro'

export const GiveUpReason = new class {
  NotRecognizeFace = 'noRecognizeFace'

  LowCameraQuali = 'lowCameraQuality'

  OvalIssue = 'oval'

  TwinIssue = 'twin'

  DoItLater = 'doItLater'

  Privacy = 'privacy'

  get reasons() {
    const { DoItLater, LowCameraQuali, NotRecognizeFace, OvalIssue, Privacy, TwinIssue } = this

    return [DoItLater, LowCameraQuali, NotRecognizeFace, OvalIssue, Privacy, TwinIssue]
  }

  get reasonsList() {
    return this.reasons.map(reason => ({ reason, text: this.getReasonText(reason) }))
  }

  getReasonText(reason) {
    const { DoItLater, LowCameraQuali, NotRecognizeFace, OvalIssue, Privacy, TwinIssue } = this
    switch (reason) {
      case NotRecognizeFace:
        return t`My face is not recognized on the camera`
      case OvalIssue:
        return t`Unable to put my face in the Oval`
      case LowCameraQuali:
        return t`I think my camera quality is too low`
      case TwinIssue:
        return t`It says I have a twin`
      case Privacy:
        return t`Privacy concern`
      case DoItLater:
        return t`I will do it later`
      default:
        throw new Error('Unknown / invalid reason specified')
    }
  }
}()
