// @flow
import React, { useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
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
  const userStorage = useWrappedUserStorage()
  const storedProfile = GDStore.useStore().get('privateProfile')

  const [profile, setProfile] = useState(storedProfile)
  const [saving, setSaving] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isPristine, setIsPristine] = useState(true)
  const [errors, setErrors] = useState({})
  const [showErrorDialog] = useErrorDialog()

  useEffect(() => {
    setProfile(storedProfile)
  }, [isEqual(profile, {}) && storedProfile])

  const validatePristine = () => {
    const stored = {
      username: `${storedProfile.username}`,
      email: storedProfile.email,
      fullName: storedProfile.fullName,
      mobile: storedProfile.mobile,
      walletAddress: storedProfile.walletAddress,
    }
    const modified = {
      username: `${profile.username}`,
      email: profile.email,
      fullName: profile.fullName,
      mobile: profile.mobile,
      walletAddress: profile.walletAddress,
    }
    setIsPristine(isEqual(stored, modified))
  }

  const validate = debounce(async () => {
    if (profile && profile.validate) {
      validatePristine()

      const { isValid, errors } = profile.validate()
      const { isValid: isValidIndex, errors: errorsIndex } = await userStorage.validateProfile(profile)

      setErrors(merge(errors, errorsIndex))
      setIsValid(isValid && isValidIndex)
    }
  }, 500)

  const handleProfileChange = newProfile => {
    if (saving) {
      return
    }
    setProfile(newProfile)
  }

  const handleSaveButton = () => {
    setSaving(true)

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
            disabled={isPristine || saving || !isValid}
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
