// @flow
import React, { useCallback } from 'react'
import { Platform, View } from 'react-native'
import { t, Trans } from '@lingui/macro'
import { fireEvent, RESENDING_MAGICLINK_SUCCESS } from '../../lib/analytics/analytics'
import API, { throwException } from '../../lib/API'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { useDialog } from '../../lib/dialog/useDialog'
import { CustomButton } from '../common'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import { withStyles } from '../../lib/styles'
import Illustration from '../../assets/Signup/maginLinkIllustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import Wrapper from '../common/layout/Wrapper'
import { theme } from '../theme/styles'

const log = logger.child({ from: 'MagicLinkInfo' })

const MagicLinkInfoComponent = props => {
  const { styles, screenProps } = props
  const { showDialog, showErrorDialog } = useDialog()
  const userStorage = useUserStorage()

  const sendMagicEmail = useCallback(() => {
    API.sendMagicLinkByEmail(userStorage.getMagicLink())
      .then(r => {
        log.info('Resending magiclink')
        fireEvent(RESENDING_MAGICLINK_SUCCESS)
        showDialog({
          title: t`Hocus Pocus!`,
          message: t`We sent you an email with your Magic Link`,
          onDismiss: () => screenProps.goToRoot(),
        })
      })
      .catch(throwException)
      .catch(e => {
        log.error('failed Resending magiclink', e.message, e, { dialogShown: true })
        showErrorDialog(t`'Could not send magic-link email. Please try again.`)
      })
  }, [screenProps, showErrorDialog, showDialog])

  const onPressOk = useCallback(screenProps.pop)

  return (
    <Wrapper backgroundColor={props.theme.colors.surface}>
      <Section grow style={styles.section}>
        <Section.Stack grow justifyContent="space-evenly">
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <View style={styles.bottomContainer}>
              <Text fontWeight="bold" fontSize={28} fontFamily={theme.fonts.slab} color="primary">
                {t`Abracadabra
                And you’re in!`}
              </Text>
            </View>
          </Section.Row>
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <View style={styles.bottomContainer}>
              <Trans>
                <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
                  {t`By clicking your `}
                  <Text fontWeight="bold" fontSize={22} fontFamily="Roboto">
                    {'Magic Link\n'}
                  </Text>
                  {t`you can sign in from any device `}
                </Text>
              </Trans>
            </View>
          </Section.Row>
          <View style={styles.illustration}>
            <Illustration />
          </View>
        </Section.Stack>
      </Section>
      <Section.Stack alignItems="stretch">
        <CustomButton mode="outlined" dark={false} onPress={sendMagicEmail}>
          {t`EMAIL ME THE MAGIC LINK`}
        </CustomButton>
        <CustomButton style={styles.downBtn} onPress={onPressOk}>
          {t`OK`}
        </CustomButton>
      </Section.Stack>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    headerText: {
      borderBottomWidth: 2,
      ...Platform.select({
        web: {
          borderBottomStyle: 'solid',
        },
      }),
      borderBottomColor: theme.colors.primary,
      paddingBottom: getDesignRelativeHeight(5, false),
    },
    mainWrapper: {
      display: 'flex',
      paddingHorizontal: 0,
      justifyContent: 'space-evenly',
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      maxHeight: getDesignRelativeHeight(230),
      minHeight: getDesignRelativeHeight(140),
    },
    wrapper: {
      padding: theme.sizes.defaultDouble,
    },
    downBtn: {
      marginTop: theme.sizes.defaultDouble,
    },
    section: {
      padding: 0,
    },
  }
}

const MagicLinkInfo = withStyles(getStylesFromProps)(MagicLinkInfoComponent)

MagicLinkInfo.navigationOptions = {
  title: 'Magic Link',
}

export default withStyles(getStylesFromProps)(MagicLinkInfo)
