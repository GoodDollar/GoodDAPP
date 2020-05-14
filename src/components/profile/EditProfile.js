// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { isBrowser } from 'mobile-device-detect'
import { debounce, isEqual, isEqualWith, merge, pickBy } from 'lodash'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { withStyles } from '../../lib/styles'
import { Section, UserAvatar, Wrapper } from '../common'
import SaveButton from '../common/animations/SaveButton/SaveButton'
import SaveButtonDisabled from '../common/animations/SaveButton/SaveButtonDisabled'
import { fireEvent, PROFILE_UPDATE } from '../../lib/analytics/analytics'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import CameraButton from './CameraButton'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })
const avatarSize = getDesignRelativeWidth(136)
const AVATAR_MARGIN = 6

// To remove profile values that are already failing
function filterObject(obj) {
  return pickBy(obj, (v, k) => v !== undefined && v !== '')
}

const EditProfile = ({ screenProps, styles, navigation }) => {
  const store = GDStore.useStore()
  const storedProfile = store.get('privateProfile')
  const [profile, setProfile] = useState(storedProfile)
  const [saving, setSaving] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isPristine, setIsPristine] = useState(true)
  const [errors, setErrors] = useState({})
  const [lockSubmit, setLockSubmit] = useState(false)
  const [showErrorDialog] = useErrorDialog()
  const { push } = screenProps

  useEffect(() => {
    if (isEqual(storedProfile, {})) {
      updateProfile()
    }
  }, [])

  // Validate after saving profile state in order to show errors
  useEffect(() => {
    //need to pass parameters into memoized debounced method otherwise setX hooks wont work
    validate()
  }, [profile])

  const updateProfile = useCallback(async () => {
    // initialize profile value for first time from storedProfile in userStorage
    const profileFromUserStorage = await userStorage.getProfile()
    store.set('privateProfile')(profileFromUserStorage)
    setProfile(profileFromUserStorage)
  }, [store, setProfile])

  const validate = useCallback(
    debounce(async () => {
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

          // showErrorDialog('Unexpected error while validating profile', e)
          return false
        }
      }
      return false
    }, 500),
    [profile, storedProfile, setIsPristine, setErrors, setIsValid]
  )

  const handleProfileChange = useCallback(
    newProfile => {
      if (saving) {
        return
      }
      setProfile(newProfile)
    },
    [setProfile, saving]
  )

  const handleSaveButton = useCallback(async () => {
    setSaving(true)

    fireEvent(PROFILE_UPDATE)

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
        showErrorDialog('Could not save profile. Please try again.')
        return false
      })
      .finally(_ => setSaving(false))
  }, [setSaving, storedProfile, showErrorDialog])

  const onProfileSaved = useCallback(() => {
    push(`Dashboard`)
  }, [push])

  const handleAvatarPress = useCallback(
    event => {
      event.preventDefault()
      push(`ViewAvatar`)
    },
    [push]
  )

  const handleCameraPress = useCallback(
    event => {
      event.preventDefault()
      push(`ViewAvatar`)
    },
    [push]
  )

  return (
    <Wrapper>
      <Section.Row justifyContent="center" alignItems="flex-start" style={styles.userDataAndButtonsRow}>
        <UserAvatar
          profile={profile}
          onPress={handleAvatarPress}
          size={avatarSize}
          imageSize={avatarSize - AVATAR_MARGIN}
          style={styles.userAvatar}
          containerStyle={styles.userAvatarWrapper}
        >
          <CameraButton handleCameraPress={handleCameraPress} />
        </UserAvatar>
        {lockSubmit || isPristine || !isValid ? (
          <SaveButtonDisabled style={styles.animatedSaveButton} />
        ) : (
          <SaveButton
            loading={saving}
            onPress={handleSaveButton}
            onFinish={onProfileSaved}
            style={styles.animatedSaveButton}
          />
        )}
      </Section.Row>
      <Section grow>
        <View style={styles.emptySpace} />
        <ProfileDataTable
          onChange={handleProfileChange}
          editable
          errors={errors}
          profile={profile}
          storedProfile={storedProfile}
          setLockSubmit={setLockSubmit}
          navigation={navigation}
        />
      </Section>
    </Wrapper>
  )
}

EditProfile.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => {
  const halfAvatarSize = avatarSize / 2
  const { white } = theme.colors

  return {
    animatedSaveButton: {
      position: 'absolute',
      width: isBrowser ? 110 : 100,
      height: 50,
      top: 17,
      right: -10,
      marginVertical: 0,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    userDataAndButtonsRow: {
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
      height: halfAvatarSize,
    },
    userAvatarWrapper: {
      position: 'absolute',
      borderColor: white,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: halfAvatarSize,
    },
    userAvatar: {
      borderWidth: 3,
      borderColor: white,
    },
    emptySpace: {
      height: 74,
      width: '100%',
    },
  }
}

export default withStyles(getStylesFromProps)(EditProfile)
