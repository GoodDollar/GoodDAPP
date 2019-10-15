// @flow
import React, { useState } from 'react'
import { View } from 'react-native'
import _get from 'lodash/get'
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
  const field = _get(navigation, 'state.params.field')
  const content = _get(navigation, 'state.params.content')
  let fieldToShow
  let sendToText
  let sendCodeRequestFn

  switch (field) {
    case 'phone':
      fieldToShow = 'phone number'
      sendToText = 'number'
      sendCodeRequestFn = 'sendOTP'
      break

    case 'email':
    default:
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

      await API[sendCodeRequestFn](content)

      navigation.navigate('VerifyEditCode', { field, content })
    } catch (e) {
      log.error('Failed to send code', e.message, e)

      showErrorDialog('Failed to send code', e.message || e, { onDismiss: goBack })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrapper>
      <Section grow>
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
            <Text fontSize={24} lineHeight={32} fontFamily="Roboto Slab" style={styles.content}>
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
