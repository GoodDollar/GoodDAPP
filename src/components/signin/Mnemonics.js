// @flow
//eslint-disable-next-line

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { get } from 'lodash'
import bip39 from 'bip39-light'
import { t } from '@lingui/macro'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { IS_LOGGED_IN } from '../../lib/constants/localStorage'
import logger from '../../lib/logger/js-logger'
import { ExceptionCategory } from '../../lib/exceptions/utils'
import { withStyles } from '../../lib/styles'
import { useDialog } from '../../lib/dialog/useDialog'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import restart from '../../lib/utils/restart'
import { userExists } from '../../lib/login/userExists'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import SuccessAnimation from '../common/animations/Success'
import CustomButton from '../common/buttons/CustomButton'
import InputText from '../common/form/InputText'
import { CLICK_BTN_RECOVER_WALLET, fireEvent, RECOVER_FAILED, RECOVER_SUCCESS } from '../../lib/analytics/analytics'
import Wrapper from '../common/layout/Wrapper'
import normalize from '../../lib/utils/normalizeText'
import { theme } from '../theme/styles'

const TITLE = 'Recover'
const log = logger.child({ from: TITLE })
const MAX_WORDS = 12

const Mnemonics = ({ screenProps, navigation, styles }) => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [isRecovering, setRecovering] = useState(false)
  const [isSubmitBlocked, setSubmitBlocked] = useState(true)
  const { showDialog, hideDialog, showErrorDialog } = useDialog()
  const [errorMessage, setErrorMessage] = useState()
  const input = useRef()

  const handleChange = (mnemonics: string) => {
    log.info({ mnemonics })
    const splitted = mnemonics.split(/\s+/).filter(o => o)
    if (splitted.length > MAX_WORDS) {
      setErrorMessage('Your pass phrase appears to be incorrect.')
    } else {
      setErrorMessage(null)
    }
    if (splitted.length === MAX_WORDS) {
      setSubmitBlocked(false)
    } else {
      setSubmitBlocked(true)
    }
    mnemonics = splitted.join(' ')
    setMnemonics(mnemonics)
  }

  const recover = useCallback(async () => {
    //required to wallet and storage are reinitialized
    const curVersion = await AsyncStorage.getItem('GD_version')
    await AsyncStorage.clear()
    AsyncStorage.setItem('GD_version', curVersion)

    input.current.blur()
    setRecovering(true)
    fireEvent(CLICK_BTN_RECOVER_WALLET)

    const showError = () => {
      const error = new Error('Incorrect pass phrase received')

      log.warn('Wallet recover failed', error.message, error, {
        mnemonics,
        category: ExceptionCategory.Human,
        dialogShown: true,
      })
      showErrorDialog(
        t`Your pass phrase appears
      to be incorrect.`,
        undefined,
        {
          title: t`Ooops ...`,
          boldMessage: t`Please check it and try again.`,
        },
      )
    }

    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      fireEvent(RECOVER_FAILED, { invalidMnemonics: true })
      setRecovering(false)
      showError()
      return
    }

    const { getMnemonics, saveMnemonics } = await mnemonicsHelpers
    const prevMnemonics = await getMnemonics()

    try {
      // We need to try to get a new address using new mnenonics
      //eslint-disable-next-line
      await saveMnemonics(mnemonics)

      // We validate that a user was registered for the specified mnemonics
      const { exists, fullName } = await userExists({ mnemonics })
      log.debug('userExists result:', { exists, fullName })

      if (exists) {
        await AsyncStorage.setItem(IS_LOGGED_IN, true)

        // FIXME: RN INAPPLINKS
        const incomingRedirectUrl = get(navigation, 'state.params.redirect', '/')
        const firstName = getFirstWord(fullName)
        showDialog({
          visible: true,
          image: <SuccessAnimation />,
          buttons: [{ text: 'Yay!' }],
          children: (
            <Text
              fontFamily={theme.fonts.slab}
              fontWeight="bold"
              fontSize={Platform.select({ web: 46, default: 34 })}
              style={styles.dialogTitle}
            >
              Welcome back!
            </Text>
          ),
          message: `Hi ${firstName},\nyour wallet was recovered successfully`,
          onDismiss: () => restart(incomingRedirectUrl),
        })
        fireEvent(RECOVER_SUCCESS)

        // There is no error and Profile exists. Reload screen to start with users mnemonics
        // window.location = incomingRedirectUrl
      } else {
        fireEvent(RECOVER_FAILED, { noProfileFound: true })
        await saveMnemonics(prevMnemonics)
        showError()
      }
    } catch (e) {
      fireEvent(RECOVER_FAILED, { unexpected: true })
      log.error('recover mnemonics failed', e.message, e, { dialogShown: true })
      saveMnemonics(prevMnemonics)
      showSupportDialog(showErrorDialog, hideDialog, screenProps.push)
    } finally {
      setRecovering(false)
    }
  }, [setRecovering, mnemonics, showDialog])

  const handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter') {
      recover()
    }
  }

  const incomingMnemonic = get(navigation, 'state.params.mnemonic', undefined)

  useEffect(() => {
    if (incomingMnemonic) {
      handleChange(incomingMnemonic)
    }
  }, [])

  return (
    <Wrapper style={styles.mainWrapper}>
      <Section grow={5} style={styles.wrapper}>
        <Section.Stack grow style={styles.instructions} justifyContent="space-around">
          <Text fontWeight="medium" fontSize={22}>
            {'Please enter your\n12-word pass phrase:'}
          </Text>
        </Section.Stack>
        <Section.Stack grow={4} justifyContent="space-between">
          <Section.Row justifyContent="center">
            <InputText
              value={mnemonics}
              onChangeText={handleChange}
              error={errorMessage}
              onKeyPress={handleEnter}
              getRef={input}
              showCleanAdornment
              autoFocus
              enablesReturnKeyAutomatically
              onSubmitEditing={recover}
            />
          </Section.Row>
        </Section.Stack>
        <Section.Row style={styles.instructions} justifyContent="space-around">
          <Text color="gray80Percent" fontSize={14}>
            {'You can copy-paste all of it at once\n from your '}
            <Text color="gray80Percent" fontSize={14} fontWeight="bold">
              {'backup email'}
            </Text>
          </Text>
        </Section.Row>
        <Section.Stack grow style={styles.bottomContainer} justifyContent="flex-end">
          <CustomButton style={styles.buttonLayout} onPress={recover} disabled={isSubmitBlocked || isRecovering}>
            Recover my wallet
          </CustomButton>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

Mnemonics.navigationOptions = {
  title: TITLE,
}

const mnemonicsStyles = ({ theme }) => ({
  wrapper: {
    borderRadius: 0,
  },
  instructions: {
    marginVertical: theme.paddings.defaultMargin,
  },
  buttonLayout: {
    marginTop: 20,
    marginBottom: 20,
  },
  bottomContainer: {
    maxHeight: 80,
    minHeight: 80,
  },
  mainWrapper: {
    ...Platform.select({
      web: {
        backgroundImage: 'none',
        backgroundColor: 'none',
      },
      default: {
        backgroundColor: 'transparent',
      },
    }),
  },
  dialogTitle: {
    marginBottom: 0,
    paddingTop: normalize(32),
    minHeight: normalize(24),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default withStyles(mnemonicsStyles)(Mnemonics)
