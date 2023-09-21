import { t } from '@lingui/macro'

const cancelledOptions = {
  noScan: t`I don't want my face scanned`,
  noTime: t`I don't have time for this`,
  noComprendo: t`I don't understand what I'm doing`,
  doLater: t`I will do it later`,
  techIssues: t`I'm having technical issues`,
  noVerify: t`I don't want to GoodDollar-verify anymore`,
}

const failedOptions = {
  NotRecognizeFace: t`My face is not recognized on the camera`,
  LowCameraQuali: t`I think my camera quality is too low`,
  OvalIssue: t`Unable to put my face in the Oval`,
  TwinIssue: t`It says I have a twin`,
  Privacy: t`Privacy concern`,
  DoItLater: t`I will do it later`,
}

export const GiveUpReason = new class {
  failedSurvey = failedOptions

  cancelledSurvey = cancelledOptions

  get cancelled() {
    return Object.entries(this.cancelledSurvey)
  }

  get failed() {
    return Object.entries(this.failedSurvey)
  }
}()
