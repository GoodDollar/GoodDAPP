import { t } from "@lingui/macro"
import { useCallback } from "react"
import { useDialog } from "../../../../lib/dialog/useDialog"
import { withStyles } from "../../../../lib/styles"
import { CustomButton } from "../../../common"
import GiveUpDialog from "./GiveUpDialog"
import useFVRedirect from '../hooks/useFVRedirect'

const GiveUpButton = () => {
  const { showDialog } = useDialog()
  const fvRedirect = useFVRedirect()

  // TODO: analytics
  const onReasonChosen = useCallback(
    (reason = undefined) => fvRedirect(false, reason),
    [fvRedirect]
  )

  const onGiveUp = useCallback(() => {
    showDialog({
      content: (
        <GiveUpDialog onReasonChosen={onReasonChosen} />
      ),
      isMinHeight: false,
      showButtons: false,
      onDismiss: onReasonChosen,
    })
  }, [showDialog, onReasonChosen])

  return (
    <CustomButton onPress={onGiveUp}>
      {t`I give up`}
    </CustomButton>
  )
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(GiveUpButton)
