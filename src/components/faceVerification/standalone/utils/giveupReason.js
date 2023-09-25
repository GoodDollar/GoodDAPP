import { t } from '@lingui/macro'

const GiveUpCancelled = {
  NoScan: t`I don't want my face scanned`,
  NoTime: t`I don't have time for this`,
  NoComprendo: t`I don't understand what I'm doing`,
  DoLater: t`I will do it later`,
  TechIssues: t`I'm having technical issues`,
  NoVerify: t`I don't want to GoodDollar-verify anymore`,
}

const GiveUpFailed = {
  NotRecognizeFace: t`My face is not recognized on the camera`,
  LowCameraQuali: t`I think my camera quality is too low`,
  OvalIssue: t`Unable to put my face in the Oval`,
  TwinIssue: t`It says I have a twin`,
  Privacy: t`Privacy concern`,
  BadInternet: t`I have a bad internet connection`,
  DoItLater: t`I will do it later`,
}

export { GiveUpCancelled, GiveUpFailed }
