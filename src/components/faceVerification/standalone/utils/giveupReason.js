import { t } from '@lingui/macro'

export const GiveUpCancelled = {
  NoScan: t`I don't want my face scanned for privacy concerns`,
  NoTime: t`I don't have time for this`,
  NoComprendo: t`I don't understand what I'm doing`,
  TechIssues: t`My camera isn't working or I have technical problems`,
  FirstTime: t`I'm just checking what GoodDollar is`,
  NoTrust: t`I don't trust this project`,
  OvalIssue: t`I'm not able to put my face in the circle`,
  Other: t`Something else (Contact Support)`,
}

export const GiveUpFailed = {
  LowCameraQuali: t`I think my camera quality is not good enough`,
  NotRecognizeFace: t`My face is not recognized on the camera`,
  MaybeDupe: t`I think I have another account I forgot about`,
  TwinIssue: t`It keeps saying I have a twin`,
  OvalIssue: t`I'm not able to put my face in the circle`,
  BadInternet: t`I have a bad internet connection`,
  Other: t`Something else (Contact Support)`,
}
