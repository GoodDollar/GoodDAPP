// @flow
import React, { useCallback, useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import isEqualWith from 'lodash/isEqualWith'
import isEqual from 'lodash/isEqual'

import merge from 'lodash/merge'
import userStorage from '../../lib/gundb/UserStorage'
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
  const storedProfile = store.get('privateProfile')
  const [profile, setProfile] = useState(storedProfile)
  const [saving, setSaving] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isPristine, setIsPristine] = useState(true)
  const [errors, setErrors] = useState({})
  const [showErrorDialog] = useErrorDialog()

  //initialize profile value for first time from storedprofile
  useEffect(() => {
    setProfile(storedProfile)
  }, [isEqual(profile, {}) && storedProfile])

  const validate = useCallback(
    debounce(async (profile, storedProfile, setIsPristine, setErrors, setIsValid) => {
      if (profile && profile.validate) {
        try {
          const pristine = isEqualWith(storedProfile, profile, (x, y) => {
            if (typeof x === 'function') {
              return true
            }
            if (['string', 'number'].includes(typeof x)) {
              return x.toString() === y.toString()
            }
            return undefined
          })
          const { isValid, errors } = profile.validate()
          const { isValid: isValidIndex, errors: errorsIndex } = await userStorage.validateProfile(profile)

          setErrors(merge(errors, errorsIndex))
          setIsValid(isValid && isValidIndex)
          setIsPristine(pristine)
        } catch (e) {
          log.error('validate profile failed', e, e.message)
          showErrorDialog('Unexpected error while validating profile', e)
        }
      }
    }, 500),
    []
  )

  const handleProfileChange = newProfile => {
    //immediatly mark as invalid
    setIsValid(false)
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
        showErrorDialog('Unexpected error while saving profile', err)
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
    //need to pass parameters into memoized debounced method otherwise setX hooks wont work
    validate(profile, storedProfile, setIsPristine, setErrors, setIsValid)
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
