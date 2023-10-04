import { t } from '@lingui/macro'

export const GiveUpCancelled = {
  NoScan: t`I don't want my face scanned for privacy concerns`,
  NoTime: t`I don't have time for this`,
  NoComprendo: t`I don't understand what I'm doing`,
  TechIssues: t`My camera isn't working or I have other technical problems`,
  FirstTime: t`I'm just checking what GoodDollar is`,
  NoTrust: t`I don't trust this project`,
  OvalIssue: t`I'm not able to put my face in the circle`,
  Other: t`Something else (Contact Support)`,
}

export const GiveUpFailed = {
  MaybeDupe: t`I think I have another account I forgot about`,
  TwinIssue: t`It keeps saying I have a twin but have never registered before`,
  OvalIssue: t`I'm not able to put my face in the circle`,
  NoClearPic: t`It says it needs a clearer video selfie`,
  DeviceIssue: t`It says I need to switch to another device`,
  Other: t`Something else (Contact Support)`,
}
