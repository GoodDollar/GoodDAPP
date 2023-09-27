import { t } from '@lingui/macro'
import React, { useCallback } from 'react'
import { View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { useDialog } from '../../../../lib/dialog/useDialog'
import { withStyles } from '../../../../lib/styles'
import { Section, Text } from '../../../common'
import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'
import { GiveUpCancelled, GiveUpFailed } from '../utils/giveupReason'

const OptionsRow = ({ styles, theme, reason, text }) => (
  <View style={styles.optionsRowContainer}>
    <View style={styles.optionsRowTitle}>
      <RadioButton value={reason} uncheckedColor={theme.colors.gray} color={theme.colors.primary} />
    </View>
    <Text style={styles.growTwo} textAlign="left" color="gray" fontWeight="medium">
      {text}
    </Text>
  </View>
)

const GiveUpDialog = ({ styles, theme, onReasonChosen, type }) => {
  const { hideDialog } = useDialog()

  const onSelected = useCallback(
    value => {
      hideDialog()
      onReasonChosen(value)
    },
    [hideDialog, onReasonChosen],
  )

  const title = type === 'cancelled' ? t`Why didn't you complete the GoodDollar-verification?` : t`What happened?`
  const GiveUpReason = type === 'cancelled' ? GiveUpCancelled : GiveUpFailed
  return (
    <ExplanationDialog title={title}>
      <Section.Stack justifyContent="flex-start" style={styles.optionsRowWrapper}>
        <RadioButton.Group onValueChange={onSelected}>
          {Object.entries(GiveUpReason).map(([reason, text]) => (
            <OptionsRow key={reason} {...{ reason, text, theme, styles }} />
          ))}
        </RadioButton.Group>
      </Section.Stack>
    </ExplanationDialog>
  )
}

const getStylesFromProps = ({ theme }) => ({
  optionsRowContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderStyle: 'solid',
    borderBottomColor: theme.colors.lightGray,
    borderBottomWidth: 1,
    padding: theme.paddings.mainContainerPadding,
    paddingLeft: theme.sizes.defaultQuadruple,
  },
  growTwo: {
    flexGrow: 2,
  },
  optionsRowTitle: {
    width: '15%',
    minWidth: 60,
    alignItems: 'center',
  },
  optionsRowWrapper: {
    padding: 0,
  },
})

export default withStyles(getStylesFromProps)(GiveUpDialog)
