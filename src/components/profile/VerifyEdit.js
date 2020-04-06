// @flow
import React, { useState } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import { Section, Wrapper } from '../common'
import Text from '../common/view/Text'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import CustomButton from '../common/buttons/CustomButton'
import API from '../../lib/API/api'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

const TITLE = 'Edit Profile'

const log = logger.child({ from: 'Verify edit profile field' })

const EditProfile = ({ screenProps, theme, styles, navigation }) => {
  const [loading, setLoading] = useState(false)
  const [showErrorDialog] = useErrorDialog()
  const gdstore = GDStore.useStore()
  const { fullName } = gdstore.get('profile')
  const firstName = fullName && fullName.split(' ')[0]
  const field = get(navigation, 'state.params.field')
  const content = get(navigation, 'state.params.content')
  let fieldToSend
  let fieldToShow
  let sendToText
  let sendCodeRequestFn

  switch (field) {
    case 'phone':
      fieldToSend = 'mobile'
      fieldToShow = 'phone number'
      sendToText = 'number'
      sendCodeRequestFn = 'sendOTP'
      break

    case 'email':
    default:
      fieldToSend = 'email'
      fieldToShow = 'email'
      sendToText = 'email'
      sendCodeRequestFn = 'sendVerificationEmail'
      break
  }

  const goBack = () => {
    navigation.navigate('EditProfile')
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      await API[sendCodeRequestFn]({ [fieldToSend]: content })

      navigation.navigate('VerifyEditCode', { field, content })
    } catch (e) {
      log.error('Failed to send code', e.message, e)

      showErrorDialog('Could not send verification code. Please try again', null, { onDismiss: goBack })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrapper>
      <Section grow justifyContent="space-between">
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <View style={styles.bottomContainer}>
            <Text fontSize={22} lineHeight={25} fontWeight="medium" fontFamily="Roboto" style={styles.mainText}>
              {`${firstName},\nwe need to verify your\n${fieldToShow} again…`}
            </Text>
          </View>
        </Section.Row>
        <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.descriptionWrap]}>
          <View style={styles.bottomContainer}>
            <Text fontSize={14} lineHeight={16} fontFamily="Roboto" color="gray80Percent">
              {`A verification code will be sent to this ${sendToText}:`}
            </Text>
            <Text
              fontSize={24}
              lineHeight={32}
              //fontFamily="RobotoSlab"
              fontFamily="Roboto"
              style={styles.content}
            >
              {content}
            </Text>
          </View>
        </Section.Row>
        <Section.Row>
          <View style={[styles.bottomContainer, styles.buttonsWrap]}>
            <CustomButton mode="text" color="gray80Percent" onPress={goBack} style={styles.cancelButton}>
              {'Cancel'}
            </CustomButton>
            <CustomButton onPress={handleSubmit} style={styles.submitButton} loading={loading}>
              {`Verify my ${sendToText}`}
            </CustomButton>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

EditProfile.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => ({
  mainText: {
    marginTop: getDesignRelativeHeight(38),
  },
  descriptionWrap: {
    marginVertical: 'auto',
  },
  content: {
    marginTop: getDesignRelativeHeight(16),
  },
  buttonsWrap: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  submitButton: {
    width: '71%',
  },
  cancelButton: {
    width: '28%',
    fontSize: normalize(14),
  },
})

export default withStyles(getStylesFromProps)(EditProfile)
