// @flow
import React, { useEffect, useState } from 'react'
import { RadioButton } from 'react-native-paper'
import { TouchableOpacity } from 'react-native'
import { startCase } from 'lodash'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { BackButton } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { CustomButton, Icon, Section, Text } from '../common'
import { fireEvent, PROFILE_PRIVACY } from '../../lib/analytics/analytics'
import { useDialog } from '../../lib/undux/utils/dialog'
import Wrapper from '../common/layout/Wrapper'
import OptionsRow from './OptionsRow'

const TITLE = 'PROFILE PRIVACY'
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

const ProfilePrivacy = props => {
  const [initialPrivacy, setInitialPrivacy] = useState(initialState)
  const [privacy, setPrivacy] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [field, setField] = useState(false)
  const { screenProps, styles, theme } = props
  const [showDialog] = useDialog()

  useEffect(() => {
    // looks for the users fields' privacy
    const privacyGatherer = async () => {
      const toUpdate = profileFields.map(field => userStorage.getProfileField(field))
      const fields = await Promise.all(toUpdate)

      // set the current privacy values
      fields.forEach(({ privacy }, index) => {
        setInitialPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
        setPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
      })
    }

    privacyGatherer()
  }, [])

  const handleSaveShowTips = () => {
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
  }

  /**
   * filters the fields to be updated
   */
  const updatableValues = () => profileFields.filter(field => privacy[field] !== initialPrivacy[field])

  const handleSave = async () => {
    setLoading(true)

    fireEvent(PROFILE_PRIVACY, { privacy: privacy[field], field })

    try {
      // filters out fields to be updated
      const toUpdate = updatableValues().map(field => ({
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
  }

  return (
    <Wrapper style={styles.mainWrapper}>
      <Section grow style={styles.wrapper}>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row grow justifyContent="center" style={styles.subtitleRow}>
            <Section.Text fontWeight="bold" color="gray">
              Manage your privacy settings
            </Section.Text>
            <InfoIcon style={styles.infoIcon} color={theme.colors.primary} onPress={() => handleSaveShowTips()} />
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
        </Section.Stack>

        <Section.Row grow alignItems="flex-end" style={styles.buttonsRow}>
          <BackButton mode="text" screenProps={screenProps} style={styles.growOne}>
            Cancel
          </BackButton>
          <CustomButton
            onPress={handleSave}
            mode="contained"
            loading={loading}
            disabled={updatableValues().length === 0}
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
const InfoIcon = ({ color, onPress, size, style }) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Icon size={size || 16} color={color} name="system-filled" />
  </TouchableOpacity>
)

const getStylesFromProps = ({ theme }) => {
  return {
    wrapper: {
      borderRadius: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
    infoIcon: {
      marginLeft: 6,
    },
    optionsRowContainer: {
      padding: 0,
      height: '70%',
    },
    growOne: {
      flexGrow: 1,
    },
    growTen: {
      flexGrow: 10,
    },
    subtitleRow: {
      maxHeight: '16%',
      marginBottom: theme.sizes.defaultDouble,
    },
    buttonsRow: {
      paddingHorizontal: theme.sizes.defaultDouble,
      minHeight: 60,
    },
    dialogTipItem: {
      alignItems: 'flex-start',
      paddingVertical: 10,
    },
    mainWrapper: {
      backgroundImage: 'none',
      backgroundColor: 'none',
    },
  }
}

const profilePrivacy = withStyles(getStylesFromProps)(ProfilePrivacy)

profilePrivacy.navigationOptions = {
  title: TITLE,
}

export default profilePrivacy
