// @flow
import React, { useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { withStyles } from '../../lib/styles'
import { SaveButton, Section, UserAvatar, Wrapper } from '../common'
import CameraButton from './CameraButton'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })

const EditProfile = ({ screenProps, theme, styles }) => {
  const store = GDStore.useStore()
  const userStorage = useWrappedUserStorage()
  const storedProfile = store.get('privateProfile')

  const [profile, setProfile] = useState(storedProfile)
  const [saving, setSaving] = useState()
  const [isValid, setIsValid] = useState()
  const [errors, setErrors] = useState({})
  const [showErrorDialog] = useErrorDialog()

  useEffect(() => {
    setProfile(storedProfile)
  }, [storedProfile])

  const validate = debounce(async () => {
    log.info({ validate: profile })
    if (profile && profile.validate) {
      const { isValid, errors } = profile.validate()
      const { isValid: indexIsValid, errors: indexErrors } = await userStorage.validateProfile(profile)
      setErrors({ ...errors, ...indexErrors })
      setIsValid(isValid && indexIsValid)
      return isValid && indexIsValid
    }
    return false
  }, 500)

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

    return userStorage
      .setProfile(profile)
      .catch(err => {
        log.error('Error saving profile', { err, profile })
        showErrorDialog('Saving profile failed', err)
      })
      .finally(_ => setSaving(false))
  }

  const onProfileSaved = () => {
    log.info('called??')
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
      <Section style={styles.section} grow>
        <Section.Row justifyContent="center" alignItems="flex-start">
          <UserAvatar profile={profile} onPress={handleAvatarPress}>
            <CameraButton handleCameraPress={handleCameraPress} />
          </UserAvatar>
          <SaveButton
            disabled={saving || !isValid}
            beforeSave={validate}
            onPress={handleSaveButton}
            onPressDone={onProfileSaved}
          />
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
  },
})

export default withStyles(getStylesFromProps)(EditProfile)
