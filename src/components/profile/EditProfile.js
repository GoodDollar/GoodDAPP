// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { CustomButton, Section, UserAvatar, Wrapper } from '../common'
import CameraButton from './CameraButton'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })

const EditProfile = props => {
  const store = GDStore.useStore()
  const userStorage = useWrappedUserStorage()
  const { screenProps } = props

  const [profile, setProfile] = useState(store.get('profile'))
  const [saving, setSaving] = useState()
  const [isValid, setIsValid] = useState()
  const [errors, setErrors] = useState({})
  const [showErrorDialog] = useErrorDialog()

  const validate = async () => {
    const { isValid, errors } = profile.validate()
    const { isValid: indexIsValid, errors: indexErrors } = await userStorage.validateProfile(profile)
    setErrors({ ...errors, ...indexErrors })
    setIsValid(isValid && indexIsValid)
    return isValid && indexIsValid
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
          <UserAvatar onChange={handleProfileChange} editable={true} profile={profile} onPress={handleAvatarPress}>
            <CameraButton handleCameraPress={handleCameraPress} />
          </UserAvatar>
          <CustomButton
            disabled={saving || !isValid}
            loading={saving}
            mode="outlined"
            style={styles.saveButton}
            onPress={handleSaveButton}
          >
            Save
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

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  saveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
})

export default EditProfile
