// @flow
/* eslint-disable no-unused-vars */

// libraries
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RadioButton } from 'react-native-paper'
import { Platform, TouchableOpacity } from 'react-native'
import { mapValues, pick, startCase } from 'lodash'

// custom components
import { t } from '@lingui/macro'
import { Switch } from 'react-native-switch'

import { useDebounce } from 'use-debounce'
import Wrapper from '../common/layout/Wrapper'
import { Icon, Section, Text } from '../common'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'
import { useDialog } from '../../lib/dialog/useDialog'

// utils
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import { fireEvent, PROFILE_PRIVACY } from '../../lib/analytics/analytics'
import { getDesignRelativeHeight, isSmallDevice } from '../../lib/utils/sizes'
import usePermissions from '../permissions/hooks/usePermissions'
import { Permissions } from '../permissions/types'

// assets
import OptionsRow from '../profile/OptionsRow'
import Config from '../../config/config'
import { isWeb } from '../../lib/utils/platform'

// initialize child logger
const log = logger.child({ from: 'ProfilePrivacy' })

// privacy options
const privacyOptions = ['private', 'masked', 'public']
const tips = {
  private: 'Your details will not be visible.',
  masked: 'Your details will be partially visible\n(e.g.: ****ple@***.com).',
  public: 'Your details will be fully visible.',
}

// fields to manage privacy of
const profileFields = ['mobile', 'email']
const titles = { mobile: 'Phone number', email: 'Email' }

const { enableWebNotifications } = Config

const PrivacyOption = ({ title, value, field, setPrivacy }) => {
  const handlePrivacyChange = useCallback(
    value => {
      setPrivacy(privacy => ({ ...privacy, [field]: value }))
    },
    [setPrivacy, field],
  )

  return (
    <RadioButton.Group onValueChange={handlePrivacyChange} value={value}>
      <OptionsRow title={title} />
    </RadioButton.Group>
  )
}

const Settings = ({ screenProps, styles, theme, navigation }) => {
  const { navigate } = navigation
  const userStorage = useUserStorage()
  const { userProperties } = userStorage || {}
  const [shouldRemindClaims, setRemindClaims] = useState(userProperties.getLocal('shouldRemindClaims'))
  const screenStateRef = useRef(screenProps?.screenState)

  const handleRemindChange = useCallback(
    value => {
      userProperties.setLocal('shouldRemindClaims', value)
      setRemindClaims(value)
    },
    [userProperties, setRemindClaims],
  )

  const [allowedNotificationPermissions, requestNotificationPermissions] = usePermissions(Permissions.Notifications, {
    requestOnMounted: false,
    onAllowed: () => handleRemindChange(true),
    onDenied: () => handleRemindChange(false),
    navigate,
  })

  const [initialPrivacy, setInitialPrivacy] = useState(() => {
    const profile = userStorage.getProfile()

    return mapValues(pick(profile, profileFields), 'privacy')
  })

  const [privacy, setPrivacy] = useState(initialPrivacy)
  const { showDialog } = useDialog()

  const handleClaimReminders = useCallback(
    value => {
      if (value && !allowedNotificationPermissions) {
        requestNotificationPermissions()
        return
      }

      handleRemindChange(value)
    },
    [allowedNotificationPermissions, requestNotificationPermissions, handleRemindChange],
  )

  const handleSaveShowTips = useCallback(() => {
    showDialog({
      title: t`SETTINGS`,
      content: (
        <Section.Stack grow>
          {privacyOptions.map(field => (
            <Section key={field} style={styles.dialogTipItem}>
              <Text fontWeight="bold" fontSize={18} color="primary" textAlign="left">
                {startCase(field)}
              </Text>
              <Text textAlign="left">{tips[field]}</Text>
            </Section>
          ))}
        </Section.Stack>
      ),
      buttons: [
        {
          text: t`Ok`,
          onPress: dismiss => {
            dismiss()
          },
        },
      ],
    })
  }, [showDialog])

  const [debouncedPrivacy] = useDebounce(privacy, 500)

  useEffect(() => {
    const valuesToBeUpdated = profileFields.filter(field => debouncedPrivacy[field] !== initialPrivacy[field])

    if (!valuesToBeUpdated.length) {
      return
    }

    fireEvent(PROFILE_PRIVACY, {
      privacy: valuesToBeUpdated.map(k => debouncedPrivacy[k]),
      valuesToBeUpdated,
    })

    /* eslint-disable */
    Promise
      .all(valuesToBeUpdated.map( // update fields
        field => userStorage.setProfileFieldPrivacy(field, debouncedPrivacy[field])
      ))
      .then(() => setInitialPrivacy(debouncedPrivacy)) // resets initial privacy states with currently set values
      .catch(e => log.error('Failed to save new privacy', e.message, e))
    /* eslint-enable */
  }, [debouncedPrivacy, initialPrivacy, setInitialPrivacy, userStorage])

  useEffect(() => {
    if (screenStateRef.current?.from === 'Claim') {
      handleClaimReminders(true)
    }
  }, [])

  return (
    <Wrapper style={styles.mainWrapper} withGradient={false}>
      <Section grow style={styles.wrapper}>
        <Section.Stack grow justifyContent="flex-start">
          {isWeb && !enableWebNotifications ? null : (
            <>
              <Section.Row justifyContent="center" style={styles.subtitleRow}>
                <Section.Text fontWeight="bold" color="gray">
                  {t`Notifications`}
                </Section.Text>
              </Section.Row>
              <Section.Row style={styles.switchRowContainer}>
                <Text>{t`Claim Reminders`}</Text>

                <Switch
                  value={shouldRemindClaims}
                  onValueChange={handleClaimReminders}
                  circleSize={16}
                  barHeight={20}
                  circleBorderWidth={0}
                  backgroundActive={'#0891B2'}
                  backgroundInactive={'#D4D4D4'}
                  circleActiveColor={'#fff'}
                  circleInActiveColor={'#fff'}
                  changeValueImmediately
                  renderActiveText={false}
                  renderInActiveText={false}
                  switchLeftPx={1.6}
                  switchRightPx={1.6}
                  switchWidthMultiplier={40 / 16}
                  switchBorderRadius={30}
                />
              </Section.Row>
            </>
          )}
          <Section.Row justifyContent="center" style={styles.subtitleRow}>
            <Section.Text fontWeight="bold" color="gray">
              {t`Manage your privacy settings`}
            </Section.Text>
            <InfoIcon style={styles.infoIcon} color={theme.colors.primary} onPress={handleSaveShowTips} />
          </Section.Row>
          <Section.Stack justifyContent="flex-start" style={styles.optionsRowContainer}>
            <OptionsRow />
            {profileFields.map(field => (
              <PrivacyOption
                key={field}
                field={field}
                title={titles[field]}
                value={privacy[field]}
                setPrivacy={setPrivacy}
              />
            ))}
          </Section.Stack>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

/**
 * InfoIcon component
 * @param {object} props
 * @param {string} props.color
 * @param {Function} props.onPress
 * @param {number} props.size
 * @returns {ReactNode}
 * @constructor
 */
const InfoIcon = ({ color, onPress, size, style }) => {
  const _onPress = useOnPress(onPress)
  return (
    <TouchableOpacity onPress={_onPress} style={style}>
      <Icon size={size || 16} color={color} name="faq" />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => {
  const wrapper = {
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: getDesignRelativeHeight(10),
    marginBottom: theme.paddings.bottomPadding,
  }

  if (isSmallDevice) {
    wrapper.paddingBottom = getDesignRelativeHeight(3)
    wrapper.paddingTop = getDesignRelativeHeight(5)
  }

  return {
    wrapper,
    infoIcon: {
      marginLeft: 6,
    },
    optionsRowContainer: {
      padding: 0,
    },
    growOne: {
      flexGrow: 1,
    },
    growTen: {
      flexGrow: 10,
    },
    subtitleRow: {
      maxHeight: '16%',
      marginBottom: getDesignRelativeHeight(isSmallDevice ? 20 : 30),
      marginTop: theme.sizes.defaultQuadruple,
    },
    buttonsRow: {
      paddingHorizontal: theme.sizes.defaultDouble,
    },
    dialogTipItem: {
      alignItems: 'flex-start',
      paddingVertical: 10,
    },
    mainWrapper: {
      ...Platform.select({
        web: {
          backgroundImage: 'none',
          backgroundColor: 'none',
        },
        default: { backgroundColor: 'transparent' },
      }),
    },
    switchRowContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      borderStyle: 'solid',
      borderBottomColor: theme.colors.lightGray,
      borderTopColor: theme.colors.lightGray,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      paddingVertical: theme.paddings.mainContainerPadding,
      paddingHorizontal: theme.sizes.defaultQuadruple,
      marginBottom: theme.sizes.defaultQuadruple,
    },
  }
}

const settings = withStyles(getStylesFromProps)(Settings)

settings.navigationOptions = {
  title: 'SETTINGS',
}

export default settings
