// @flow

// libraries
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RadioButton } from 'react-native-paper'
import { Platform, TouchableOpacity } from 'react-native'
import { startCase } from 'lodash'

// custom components
import Wrapper from '../common/layout/Wrapper'
import { Avatar, CustomButton, Icon, Section, Text } from '../common'
import { BackButton } from '../appNavigation/stackNavigation'
import BorderedBox from '../common/view/BorderedBox'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'
import { useDialog } from '../../lib/undux/utils/dialog'

// utils
import userStorage from '../../lib/userStorage/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { fireEvent, PROFILE_PRIVACY } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import { getDesignRelativeHeight, isSmallDevice } from '../../lib/utils/sizes'

// assets
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
const initialState = profileFields.reduce((acc, field) => ({ ...acc, [`${field}`]: '' }), {})
const titles = { mobile: 'Phone number', email: 'Email' }

const ProfileAvatar = withStyles(() => ({
  avatar: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
}))(({ styles, style }) => {
  const gdstore = GDStore.useStore()
  const { avatar } = gdstore.get('profile')

  return <Avatar source={avatar} style={[styles.avatar, style]} imageStyle={style} unknownStyle={style} plain />
})

const ProfilePrivacy = props => {
  const [initialPrivacy, setInitialPrivacy] = useState(initialState)
  const [privacy, setPrivacy] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [field, setField] = useState(false)
  const { screenProps, styles, theme } = props
  const [showDialog] = useDialog()

  // bordered box required data
  const faceRecordId = useMemo(() => userStorage.getFaceIdentifier(), [])

  useEffect(() => {
    // looks for the users fields' privacy
    const privacyGatherer = async () => {
      const toUpdate = profileFields.map(field => userStorage.getProfileField(field))
      const fields = await Promise.all(toUpdate)

      // set the current privacy values
      fields
        .filter(_ => _)
        .forEach(({ privacy }, index) => {
          setInitialPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
          setPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
        })
    }

    privacyGatherer()
  }, [])

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

    fireEvent(PROFILE_PRIVACY, { privacy: privacy[field], field })

    try {
      // filters out fields to be updated
      const toUpdate = valuesToBeUpdated.map(field => ({
        update: userStorage.setProfileFieldPrivacy(field, privacy[field]),
        field,
      }))

      // updates fields
      await Promise.all(toUpdate.map(({ update }) => update))

      // resets initial privacy states with currently set values
      toUpdate.map(({ field }) => setInitialPrivacy(prevState => ({ ...prevState, [`${field}`]: privacy[field] })))
    } catch (e) {
      log.error('Failed to save new privacy', e.message, e)
    }

    setLoading(false)
  }, [setLoading, valuesToBeUpdated, setInitialPrivacy, privacy, field])

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
              <RadioButton.Group
                onValueChange={value => {
                  setField(field)
                  setPrivacy(prevState => ({ ...prevState, [`${field}`]: value }))
                }}
                value={privacy[field]}
                key={field}
              >
                <OptionsRow title={titles[field]} />
              </RadioButton.Group>
            ))}
          </Section.Stack>
          <Section grow justifyContent="center">
            <BorderedBox
              image={ProfileAvatar}
              title="My Face Record ID"
              content={faceRecordId}
              truncateContent
              copyButtonText="Copy ID"
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
