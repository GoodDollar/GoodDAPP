// @flow

// libraries
import React, { useCallback, useMemo, useState } from 'react'
import { RadioButton } from 'react-native-paper'
import { Platform, TouchableOpacity } from 'react-native'
import { mapValues, pick, startCase } from 'lodash'

// custom components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Icon, Section, Text } from '../common'
import Avatar from '../common/view/Avatar'
import { BackButton } from '../appNavigation/stackNavigation'
import BorderedBox from '../common/view/BorderedBox'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'
import { useDialog } from '../../lib/undux/utils/dialog'

// utils
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import { fireEvent, PROFILE_PRIVACY } from '../../lib/analytics/analytics'
import { getDesignRelativeHeight, isSmallDevice } from '../../lib/utils/sizes'

// assets
import useProfile from '../../lib/userStorage/useProfile'
import OptionsRow from './OptionsRow'

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

const ProfileAvatar = withStyles(() => ({
  avatar: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
}))(({ styles, style }) => {
  const { smallAvatar: avatar } = useProfile()

  return <Avatar source={avatar} style={[styles.avatar, style]} imageStyle={style} unknownStyle={style} plain />
})

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

const ProfilePrivacy = ({ screenProps, styles, theme }) => {
  const userStorage = useUserStorage()
  const [initialPrivacy, setInitialPrivacy] = useState(() => {
    const profile = userStorage.getProfile()

    return mapValues(pick(profile, profileFields), 'privacy')
  })

  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [loading, setLoading] = useState(false)
  const [showDialog] = useDialog()

  // bordered box required data
  const faceRecordId = useMemo(() => userStorage.getFaceIdentifier(), [])

  const handleSaveShowTips = useCallback(() => {
    showDialog({
      title: 'SETTINGS',
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
          text: 'Ok',
          onPress: dismiss => {
            dismiss()
          },
        },
      ],
    })
  }, [showDialog])

  /**
   * filters the fields to be updated
   */
  const valuesToBeUpdated = useMemo(() => profileFields.filter(field => privacy[field] !== initialPrivacy[field]), [
    privacy,
    initialPrivacy,
  ])

  const handleSave = useCallback(async () => {
    setLoading(true)

    fireEvent(PROFILE_PRIVACY, {
      privacy: valuesToBeUpdated.map(k => privacy[k]),
      valuesToBeUpdated,
    })

    try {
      // updates fields
      await Promise.all(valuesToBeUpdated.map(field => userStorage.setProfileFieldPrivacy(field, privacy[field])))

      // resets initial privacy states with currently set values
      setInitialPrivacy(privacy)
    } catch (e) {
      log.error('Failed to save new privacy', e.message, e)
    } finally {
      setLoading(false)
    }
  }, [setLoading, valuesToBeUpdated, setInitialPrivacy, privacy, userStorage])

  return (
    <Wrapper style={styles.mainWrapper}>
      <Section grow style={styles.wrapper}>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row justifyContent="center" style={styles.subtitleRow}>
            <Section.Text fontWeight="bold" color="gray">
              Manage your privacy settings
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
          <Section grow justifyContent="center">
            <BorderedBox
              image={ProfileAvatar}
              title="My Face Record ID"
              content={faceRecordId}
              truncateContent
              copyButtonText="Copy ID"
              enableIndicateAction
            />
          </Section>
        </Section.Stack>
        <Section.Row alignItems="flex-end" style={styles.buttonsRow}>
          <BackButton mode="text" screenProps={screenProps} style={styles.growOne}>
            Cancel
          </BackButton>
          <CustomButton
            onPress={handleSave}
            mode="contained"
            loading={loading}
            disabled={!valuesToBeUpdated.length}
            style={styles.growTen}
          >
            Save
          </CustomButton>
        </Section.Row>
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
    borderRadius: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: getDesignRelativeHeight(10),
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
  }
}

const profilePrivacy = withStyles(getStylesFromProps)(ProfilePrivacy)

profilePrivacy.navigationOptions = {
  title: 'PROFILE PRIVACY',
}

export default profilePrivacy
