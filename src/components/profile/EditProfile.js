// @flow
import React, { useEffect, useState } from 'react'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { withStyles } from '../../lib/styles'
import { CustomButton, Section, Text, UserAvatar, Wrapper } from '../common'
import CameraButton from './CameraButton'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })

const EditProfile = ({ screenProps, theme, styles }) => {
  const store = GDStore.useStore()
  const userStorage = useWrappedUserStorage()
  const storedProfile = store.get('profile')

  const [profile, setProfile] = useState(storedProfile)
  const [saving, setSaving] = useState()
  const [isValid, setIsValid] = useState()
  const [errors, setErrors] = useState({})
  const [showErrorDialog] = useErrorDialog()

  useEffect(() => {
    setProfile(storedProfile)
  }, [storedProfile])

  const validate = async () => {
    log.info({ validate: profile })
    if (profile && profile.validate) {
      const { isValid, errors } = profile.validate()
      const { isValid: indexIsValid, errors: indexErrors } = await userStorage.validateProfile(profile)
      setErrors({ ...errors, ...indexErrors })
      setIsValid(isValid && indexIsValid)
      return isValid && indexIsValid
    }
    return false
  }

  const handleProfileChange = newProfile => {
    if (saving) {
      return
    }

    setProfile(newProfile)
  }

  const handleSaveButton = async () => {
    setSaving(true)
    const isValid = await validate()

    if (!isValid) {
      setSaving(false)
      return
    }

    userStorage
      .setProfile(profile)
      .catch(err => {
        log.error('Error saving profile', { err, profile })
        showErrorDialog('Saving profile failed', err)
      })
      .finally(_ => setSaving(false))
    screenProps.pop()
  }

  const handleAvatarPress = event => {
    event.preventDefault()
    event.stopPropagation()
    screenProps.push(`${profile.avatar ? 'View' : 'Edit'}Avatar`)
  }

  const handleCameraPress = event => {
    event.preventDefault()
    event.stopPropagation()
    screenProps.push('EditAvatar')
  }

  // Validate after saving profile state in order to show errors
  useEffect(() => {
    validate()
  }, [profile])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <UserAvatar profile={profile} onPress={handleAvatarPress}>
            <CameraButton handleCameraPress={handleCameraPress} />
          </UserAvatar>
          <CustomButton
            disabled={saving || !isValid}
            loading={saving}
            style={styles.saveButton}
            onPress={handleSaveButton}
            color={theme.colors.darkBlue}
            contentStyle={styles.saveButtonContent}
          >
            <Text color="surface" textTransform="uppercase" fontSize={8}>
              Save
            </Text>
          </CustomButton>
        </Section.Row>
        <ProfileDataTable onChange={handleProfileChange} editable={true} errors={errors} profile={profile} />
      </Section>
    </Wrapper>
  )
}

EditProfile.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  saveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: theme.sizes.defaultDouble,
    marginVertical: 0,
  },
  saveButtonContent: {
    maxHeight: 30,
    marginVertical: 0,
  },
})

export default withStyles(getStylesFromProps)(EditProfile)
