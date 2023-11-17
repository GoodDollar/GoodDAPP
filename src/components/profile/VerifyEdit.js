// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import { t } from '@lingui/macro'

import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import { Section, Wrapper } from '../common'
import Text from '../common/view/Text'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import CustomButton from '../common/buttons/CustomButton'
import API from '../../lib/API'
import { useDialog } from '../../lib/dialog/useDialog'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import useProfile from '../../lib/userStorage/useProfile'
import useRecaptcha from '../auth/components/Recaptcha/useRecaptcha'

const log = logger.child({ from: 'Verify edit profile field' })

const EditProfile = ({ screenProps, theme, styles, navigation }) => {
  const userStorage = useUserStorage()
  const [loading, setLoading] = useState(false)
  const { showErrorDialog } = useDialog()
  const { fullName } = useProfile()
  const firstName = fullName && fullName.split(' ')[0]
  const field = get(navigation, 'state.params.field', 'email')
  const { isValidRecaptcha, Captcha, launchCaptcha } = useRecaptcha({ enabled: field === 'phone', autoLaunch: false })
  const content = get(navigation, 'state.params.content')
  let fieldToShow = field
  let sendToText = field
  let profileField = field

  if (field === 'phone') {
    profileField = 'mobile'
    fieldToShow = 'phone number'
    sendToText = 'number'
  }

  const goBack = useCallback(() => screenProps.pop(), [screenProps])

  const handleSubmit = useCallback(async () => {
    try {
      let response
      setLoading(true)

      switch (field) {
        case 'phone':
          response = await API.sendOTP({ mobile: content }, true) //true = only check if number already verified
          break
        case 'email':
          response = await API.sendVerificationEmail({ email: content })
          break
        default:
          throw new Error(`Invalid field name to confirm. Should be 'email' or 'phone'.`)
      }

      const { alreadyVerified = false } = response.data || {}

      if (alreadyVerified) {
        logger.debug('send code', { alreadyVerified, profileField, content })
        await userStorage.setProfileField(profileField, content)
        screenProps.pop()
      } else {
        if (field === 'phone') {
          launchCaptcha() //once captcha is verified the effect will trigger to sendotp and redirect to verifyeditcode screen
        } else {
          screenProps.push('VerifyEditCode', { field, content })
        }
      }
    } catch (e) {
      log.error('Failed to send code', e.message, e, { dialogShown: true })

      showErrorDialog(t`Could not send verification code. Please try again`, undefined, { onDismiss: goBack })
    } finally {
      setLoading(false)
    }
  }, [setLoading, screenProps, content, goBack, showErrorDialog, userStorage])

  useEffect(() => {
    if (isValidRecaptcha && field === 'phone') {
      API.sendOTP({ mobile: content }, false) //false will try to send otp, requires captcha passed
        .then(r => screenProps.push('VerifyEditCode', { field, content }))
        .catch(e => {
          log.error('Failed to send code', e.message, e, { dialogShown: true })

          showErrorDialog(t`Could not send verification code. Please try again`, undefined, { onDismiss: goBack })
        })
    }
  }, [isValidRecaptcha, field])
  return (
    <Wrapper>
      <Captcha>
        <Section grow justifyContent="space-between">
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <View style={styles.bottomContainer}>
              <Text fontSize={22} lineHeight={25} fontWeight="medium" fontFamily="Roboto" style={styles.mainText}>
                {t`${firstName},
              we need to verify your 
              ${fieldToShow} again…`}
              </Text>
            </View>
          </Section.Row>
          <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.descriptionWrap]}>
            <View style={[styles.bottomContainer, styles.width100p]}>
              <Text fontSize={14} lineHeight={16} fontFamily="Roboto" color="gray80Percent">
                {t`A verification code will be sent to this ${sendToText}:`}
              </Text>
              <Text fontSize={24} lineHeight={32} fontFamily="Roboto" style={styles.content}>
                {content}
              </Text>
            </View>
          </Section.Row>
          <Section.Row>
            <View style={[styles.bottomContainer, styles.buttonsWrap]}>
              <CustomButton mode="text" color="gray80Percent" onPress={goBack} style={styles.cancelButton}>
                {t`Cancel`}
              </CustomButton>
              <CustomButton onPress={handleSubmit} style={styles.submitButton} loading={loading}>
                {t`Verify my ${sendToText}`}
              </CustomButton>
            </View>
          </Section.Row>
        </Section>
      </Captcha>
    </Wrapper>
  )
}

EditProfile.navigationOptions = {
  title: 'Edit Profile',
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
  width100p: {
    width: '100%',
  },
})

export default withStyles(getStylesFromProps)(EditProfile)
