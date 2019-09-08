// @flow
import React, { useCallback, useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import isEqualWith from 'lodash/isEqualWith'
import isEqual from 'lodash/isEqual'

import merge from 'lodash/merge'
import pickBy from 'lodash/pickBy'
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

// To remove profile values that are already failing
function filterObject(obj) {
  return pickBy(obj, (v, k) => v !== undefined && v !== '')
}

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

  const updateProfile = async () => {
    const profile = await userStorage.getProfile()
    store.set('privateProfile')(profile)
  }

  useEffect(() => {
    if (isEqual(storedProfile, {})) {
      updateProfile()
    }
  }, [])

  const validate = useCallback(
    debounce(async (profile, storedProfile, setIsPristine, setErrors, setIsValid) => {
      if (profile && profile.validate) {
        try {
          const pristine = isEqualWith(storedProfile, profile, (x, y) => {
            if (typeof x === 'function') {
              return true
            }
            if (['string', 'number'].includes(typeof x)) {
              return y && x.toString() === y.toString()
            }
            return undefined
          })
          const { isValid, errors } = profile.validate()

          const { isValid: isValidIndex, errors: errorsIndex } = await userStorage.validateProfile(
            filterObject(profile)
          )
          const valid = isValid && isValidIndex

          setErrors(merge(errors, errorsIndex))
          setIsValid(valid)
          setIsPristine(pristine)

          return valid
        } catch (e) {
          log.error('validate profile failed', e.message, e)
          showErrorDialog('Unexpected error while validating profile', e)
          return false
        }
      }
      return false
    }, 500),
    []
  )

  const handleProfileChange = newProfile => {
    if (saving) {
      return
    }
    setProfile(newProfile)
  }

  const handleSaveButton = async () => {
    setSaving(true)

    // with flush triggers immediate call for the validation
    if (!(await validate.flush())) {
      setSaving(false)
      return false
    }

    //create profile only with updated/new fields so we don't resave data
    const toupdate = pickBy(profile, (v, k) => {
      if (typeof v === 'function') {
        return true
      }
      if (storedProfile[k] === undefined) {
        return true
      }
      if (['string', 'number'].includes(typeof v)) {
        return v.toString() !== storedProfile[k].toString()
      }
      if (v !== storedProfile[k]) {
        return true
      }
      return false
    })
    return userStorage
      .setProfile(toupdate, true)
      .catch(e => {
        log.error('Error saving profile', { toupdate }, e.message, e)
        showErrorDialog('Unexpected error while saving profile', e)
        return false
      })
      .finally(_ => setSaving(false))
  }

  const onProfileSaved = () => {
    screenProps.pop()
  }

  const handleAvatarPress = event => {
    event.stopPropagation()
    screenProps.push(`${profile.avatar ? 'View' : 'Edit'}Avatar`)
  }

  const handleCameraPress = event => {
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
      <Section grow>
        <Section.Row justifyContent="center" alignItems="flex-start">
          <UserAvatar profile={profile} onPress={handleAvatarPress}>
            <CameraButton handleCameraPress={handleCameraPress} />
          </UserAvatar>
          <SaveButton disabled={isPristine || !isValid} onPress={handleSaveButton} onPressDone={onProfileSaved} />
        </Section.Row>
        <ProfileDataTable onChange={handleProfileChange} editable={true} errors={errors} profile={profile} />
      </Section>
    </Wrapper>
  )
}

EditProfile.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(EditProfile)
