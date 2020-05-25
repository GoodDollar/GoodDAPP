// @flow
import React from 'react'
import { View } from 'react-native'
import { fireEvent } from '../../lib/analytics/analytics'
import API from '../../lib/API/api'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { CustomButton } from '../common'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import { withStyles } from '../../lib/styles'
import MagicLinkSVG from '../../assets/Signup/maginLinkIllustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import Wrapper from '../common/layout/Wrapper'

const log = logger.child({ from: 'MagicLinkInfo' })

const MagicLinkInfoComponent = props => {
  const { styles, screenProps } = props
  const [showDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const sendMagicEmail = () => {
    API.sendMagicLinkByEmail(userStorage.getMagicLink())
      .then(r => {
        log.info('Resending magiclink')
        fireEvent('RESENDING_MAGICLINK_SUCCESS')
        showDialog({
          title: 'Hocus Pocus!',
          message: 'We sent you an email with your Magic Link',
          onDismiss: () => screenProps.goToRoot(),
        })
      })
      .catch(e => {
        log.error('failed Resending magiclink', e.message, e)
        showErrorDialog('Could not send magiclink email. Please try again.')
      })
  }

  return (
    <Wrapper backgroundColor={props.theme.colors.surface}>
      <Section grow style={styles.section}>
        <Section.Stack grow justifyContent="space-evenly">
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <View style={styles.bottomContainer}>
              <Text fontWeight="bold" fontSize={28} fontFamily="Roboto Slab" color="primary">
                {'Abracadabra\nAnd you’re in!'}
              </Text>
            </View>
          </Section.Row>
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <View style={styles.bottomContainer}>
              <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
                {'By clicking your '}
                <Text fontWeight="bold" fontSize={22} fontFamily="Roboto">
                  {'Magic Link\n'}
                </Text>
                {'you can sign in from any device '}
              </Text>
            </View>
          </Section.Row>
          <View style={styles.illustration}>
            <MagicLinkSVG />
          </View>
        </Section.Stack>
      </Section>
      <Section.Stack alignItems="stretch">
        <CustomButton mode="outlined" dark={false} onPress={sendMagicEmail}>
          EMAIL ME THE MAGIC LINK
        </CustomButton>
        <CustomButton style={styles.downBtn} onPress={screenProps.pop}>
          OK
        </CustomButton>
      </Section.Stack>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
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
