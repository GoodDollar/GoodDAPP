// @flow
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { Section } from '../common'
import Text from '../common/view/Text'
import { useDialog } from '../../lib/undux/utils/dialog'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import Config from '../../config/config'
import normalize from '../../lib/utils/normalizeText'

export type AmountProps = {
  screenProps: any,
}

const surveyOptions = ['A product', 'A service', 'Other']

/**
 * Screen that shows transaction summary for a send link action
 * @param {AmountProps} props
 * @param {any} props.handleCheckSurvey
 * @param {any} props.styles
 */
const SurveySend = ({ handleCheckSurvey, styles, onDismiss }: any) => {
  const [dialogSurvey, setDialogSurvey] = useState(true)
  const [showDialog] = useDialog()

  useEffect(() => {
    if (Config.isEToro && dialogSurvey) {
      setDialogSurvey(false)
      showDialog({
        onDismiss,
        content: <Content handleCheckSurvey={handleCheckSurvey} styles={styles} />,
        buttons: [
          {
            style: styles.OkButton,
            text: 'Ok',
            onPress: dismiss => {
              dismiss()
            },
          },
        ],
      })
    }
  }, [dialogSurvey])

  return null
}

const Content = ({ handleCheckSurvey, styles }: any) => {
  const [survey, setSurvey] = useState('other')

  const checkSurvey = value => {
    setSurvey(value)
    handleCheckSurvey(value)
  }

  return (
    <>
      <Section.Row justifyContent="center">
        <View style={styles.titleContainerSurveySend}>
          <Text textAlign="center" fontSize={24} fontWeight="bold">
            Just a quick question…
          </Text>
          <Text textAlign="center" fontSize={16}>
            (In order for us to improve)
          </Text>
        </View>
      </Section.Row>
      <Section.Row justifyContent="center" style={styles.contentBlock}>
        <View>
          <Text textAlign="center" textDecorationLine="underline" fontSize={16} fontWeight="bold">
            What are you paying for?
          </Text>
        </View>
      </Section.Row>
      <View style={styles.radioBtnMainBlock}>
        <View style={styles.radioBtnBlock}>
          <RadioButton.Group onValueChange={checkSurvey} value={survey}>
            {surveyOptions.map((field, index) => (
              <Section.Row justifyContent="flex-start" key={index}>
                <RadioButton value={field} />
                <Text>{field}</Text>
              </Section.Row>
            ))}
          </RadioButton.Group>
        </View>
      </View>
    </>
  )
}

const mapStylesToProps = ({ theme }) => {
  return {
    titleContainerSurveySend: {
      paddingVertical: theme.sizes.default,
      marginVertical: theme.sizes.default,
    },
    radioBtnMainBlock: {
      alignItems: 'center',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
    },
    contentBlock: {
      alignItems: 'center',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
    },
    radioBtnBlock: {
      width: 120,
    },
    OkButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      width: 100,
      fontSize: normalize(14),
    },
  }
}

export default withStyles(mapStylesToProps)(SurveySend)
