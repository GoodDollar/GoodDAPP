// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { isEqualWith, merge, pickBy } from 'lodash'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { withStyles } from '../../lib/styles'
import { Section, UserAvatar, Wrapper } from '../common'
import SaveButton from '../common/animations/SaveButton/SaveButton'
import SaveButtonDisabled from '../common/animations/SaveButton/SaveButtonDisabled'
import { fireEvent, PROFILE_UPDATE } from '../../lib/analytics/analytics'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { useDebounce } from '../../lib/hooks/useDebouce'
import useStoredProfile from '../../lib/hooks/useStoredProfile'
import RoundIconButton from '../common/buttons/RoundIconButton'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })
const avatarSize = getDesignRelativeWidth(136)

const EditProfile = ({ screenProps, styles, navigation }) => {
  const [storedProfile, profile, setProfile] = useStoredProfile(true)
  const [saving, setSaving] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isPristine, setIsPristine] = useState(true)
  const [errors, setErrors] = useState({})
  const [lockSubmit, setLockSubmit] = useState(false)
  const [showErrorDialog] = useErrorDialog()
  const { push, pop } = screenProps

  const deboucedProfile = useDebounce(profile, 500)
  const onProfileSaved = useCallback(() => pop(), [pop])
  const handleEditAvatar = useCallback(() => push(`ViewAvatar`), [push])

  const validate = useCallback(async () => {
    if (!profile || !profile.validate) {
      return false
    }

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
      const { isValid: isValidIndex, errors: errorsIndex } = await userStorage.validateProfile(pickBy(profile))
      const valid = isValid && isValidIndex

      setErrors(merge(errors, errorsIndex))
      setIsValid(valid)
      setIsPristine(pristine)

      return valid
    } catch (e) {
      log.warn('validate profile failed', e.message, e)
      return false
    }
  }, [profile, storedProfile, setIsPristine, setErrors, setIsValid])

  const handleProfileChange = useCallback(
    newProfile => {
      if (saving) {
        return
      }

      setProfile(newProfile)
    },
    [setProfile, saving],
  )

  const handleSaveButton = useCallback(async () => {
    setSaving(true)
    fireEvent(PROFILE_UPDATE)

    const isValid = await validate()

    // with flush triggers immediate call for the validation
    if (!isValid) {
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

    try {
      await userStorage.setProfile(toupdate, true)
    } catch (e) {
      log.error('Error saving profile', e.message, e, { toupdate, dialogShown: true })
      showErrorDialog('Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [validate, profile, setSaving, storedProfile, showErrorDialog])

  // Validate after saving profile state in order to show errors
  useEffect(() => {
    validate()
  }, [deboucedProfile])

  return (
    <Wrapper>
      <Section.Row justifyContent="space-between" alignItems="flex-start" style={styles.userDataAndButtonsRow}>
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
      <Section style={styles.section}>
        <View style={styles.emptySpace} />
        <ProfileDataTable
          onChange={handleProfileChange}
          editable
          errors={errors}
          profile={profile}
          storedProfile={storedProfile}
          setLockSubmit={setLockSubmit}
          screenProps={screenProps}
        />
      </Section>
      <View style={styles.userDataWrapper}>
        <UserAvatar
          style={styles.userAvatar}
          profile={profile}
          onPress={handleEditAvatar}
          size={avatarSize}
          imageSize={avatarSize - 6}
          unknownStyle={styles.userAvatar}
        >
          <RoundIconButton
            iconSize={22}
            iconName="camera"
            onPress={handleEditAvatar}
            containerStyle={{ zIndex: 10 }}
            style={{ zIndex: 10, top: -30, right: 15, position: 'absolute' }}
          />
        </UserAvatar>
      </View>
    </Wrapper>
  )
}

EditProfile.navigationOptions = {
  title: TITLE,
}

const getStylesFromProps = ({ theme }) => {
  const halfAvatarSize = avatarSize / 2

  return {
    userAvatar: {
      borderWidth: 3,
      borderColor: theme.colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: halfAvatarSize,
      zIndex: 1,
    },
    userDataAndButtonsRow: {
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 1,
      height: avatarSize / 2,
    },
    animatedSaveButton: {
      position: 'absolute',
      width: getDesignRelativeWidth(110),
      height: 50,
      top: getDesignRelativeHeight(18),
      right: -10,
      marginVertical: 0,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    userDataWrapper: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      zIndex: 1,
    },
    emptySpace: {
      height: 74,
      width: '100%',
    },
    section: {
      flexGrow: 1,
      padding: theme.sizes.defaultDouble,
    },
  }
}

export default withStyles(getStylesFromProps)(EditProfile)
