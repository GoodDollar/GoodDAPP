// @flow
//eslint-disable-next-line
import bip39 from 'bip39-light'
import React, { Fragment, useState } from 'react'
import { AsyncStorage, View } from 'react-native'
import { IS_LOGGED_IN } from '../../lib/constants/localStorage'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import retryImport from '../../lib/utils/retryImport'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import CustomButton from '../common/buttons/CustomButton'
import InputText from '../common/form/InputText'
import NavBar from '../appNavigation/NavBar'
import IOSWebAppSignInSVG from '../../assets/IOSWebAppSignIn.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const TITLE = 'EASY ACCESS'
const log = logger.child({ from: TITLE })

const Mnemonics = ({ screenProps, navigation, styles }) => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const [code, setCode] = useState()
  const [isRecovering, setRecovering] = useState(false)
  const [isValid, setValid] = useState(false)
  const [showErrorDialog] = useErrorDialog()

  const handleChange = (newCode: string) => {
    log.info({ newCode })

    setCode(newCode)

    if (newCode) {
      setValid(true)
    } else {
      setValid(false)
    }
  }

  const recover = async () => {
    setRecovering(true)

    const errorText = 'You are using wrong sign in code'
    let userNameAndPWD = Buffer.from(code, 'base64').toString('ascii')
    let userNameAndPWDArray = userNameAndPWD.split('+')

    log.debug('IOSSignInByMagicCode', { code, userNameAndPWDArray })

    if (userNameAndPWDArray.length === 2) {
      const userName = userNameAndPWDArray[0]
      const userPwd = userNameAndPWDArray[1]
      const UserStorage = await retryImport(() => import('../../lib/gundb/UserStorageClass').then(_ => _.UserStorage))

      const mnemonic = await UserStorage.getMnemonic(userName, userPwd)

      if (mnemonic && bip39.validateMnemonic(mnemonic)) {
        const mnemonicsHelpers = retryImport(() => import('../../lib/wallet/SoftwareWalletProvider'))
        const { saveMnemonics } = await mnemonicsHelpers

        await saveMnemonics(mnemonic)
        await AsyncStorage.setItem(IS_LOGGED_IN, 'true')

        window.location = '/'
      } else {
        showErrorDialog(errorText)
      }
    } else {
      showErrorDialog(errorText)
    }

    setRecovering(false)
  }

  const handleEnter = async (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && isValid) {
      await recover()
    }
  }

  return (
    <Fragment>
      <NavBar title={TITLE} />
      <Section grow style={styles.wrapper}>
        <Section.Stack grow style={styles.instructions} justifyContent="center">
          <Text fontWeight="medium" fontSize={22} fontFamily="Roboto" lineHeight={28} style={styles.headerText}>
            {'Easy access with iPhone!'}
          </Text>
          <Text color="gray80Percent" fontSize={14}>
            {'Copy-paste the easy access code\nsent to you by text message:'}
          </Text>
        </Section.Stack>
        <Section.Stack justifyContent="space-between">
          <Section.Row justifyContent="center">
            <InputText
              value={code}
              onChangeText={handleChange}
              onKeyPress={handleEnter}
              onCleanUpField={handleChange}
              autoFocus
            />
          </Section.Row>
        </Section.Stack>
        <View style={styles.image}>
          <IOSWebAppSignInSVG />
        </View>
        <Section style={styles.bottomContainer}>
          <CustomButton style={styles.buttonLayout} onPress={recover} disabled={!isValid || isRecovering}>
            {'SIGN IN'}
          </CustomButton>
        </Section>
      </Section>
    </Fragment>
  )
}

Mnemonics.navigationOptions = {
  title: TITLE,
}

const mnemonicsStyles = ({ theme }) => ({
  headerText: {
    marginBottom: getDesignRelativeHeight(5),
  },
  wrapper: {
    borderRadius: 0,
    paddingVertical: 0,
  },
  instructions: {
    marginTop: getDesignRelativeHeight(10),
  },
  buttonLayout: {
    marginVertical: getDesignRelativeHeight(20),
  },
  bottomContainer: {
    maxHeight: getDesignRelativeHeight(100),
    minHeight: getDesignRelativeHeight(100),
    justifyContent: 'flex-end',
  },
  image: {
    flexGrow: 1,
    flexShrink: 0,
    marginBottom: getDesignRelativeHeight(20),
    height: getDesignRelativeHeight(200),
  },
})

export default withStyles(mnemonicsStyles)(Mnemonics)
