// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { isEqualWith, pickBy } from 'lodash'
import { t } from '@lingui/macro'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { useDialog } from '../../lib/dialog/useDialog'
import { withStyles } from '../../lib/styles'
import { Section, Wrapper } from '../common'
import UserAvatar from '../common/view/UserAvatar'
import SaveButton from '../common/animations/SaveButton/SaveButton'
import SaveButtonDisabled from '../common/animations/SaveButton/SaveButtonDisabled'
import { fireEvent, PROFILE_UPDATE } from '../../lib/analytics/analytics'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import RoundIconButton from '../common/buttons/RoundIconButton'
import useProfile from '../../lib/userStorage/useProfile'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })
const avatarSize = getDesignRelativeWidth(136)

const EditProfile = ({ screenProps, styles }) => {
  const userStorage = useUserStorage()
  const storedProfile = useProfile()
  const [profile, setProfile] = useState(() => storedProfile)
  const [saving, setSaving] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [isPristine, setIsPristine] = useState(true)
  const [errors, setErrors] = useState({})
  const [lockSubmit, setLockSubmit] = useState(false)
  const { showErrorDialog } = useDialog()
  const { push, pop } = screenProps

  const onProfileSaved = useCallback(() => pop(), [pop])
  const handleEditAvatar = useCallback(() => push(`ViewAvatar`), [push])

  // eslint-disable-next-line require-await
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
      const valid = isValid

      setErrors(errors)
      setIsValid(valid)
      setIsPristine(pristine)

      return valid
    } catch (e) {
      log.warn('validate profile failed', e.message, e)
      return false
    }
  }, [profile, setIsPristine, setErrors, setIsValid])

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
    try {
      setSaving(true)
      fireEvent(PROFILE_UPDATE)

      const isValid = await validate()

      // with flush triggers immediate call for the validation
      if (!isValid) {
        setSaving(false)
        return false
      }

      // create profile only with updated/new fields so we don't resave data
      const toupdate = pickBy(profile, (v, k) => {
        if (typeof v === 'function') {
          return true
        }

        if (storedProfile[k] == null) {
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

      await userStorage.setProfile(toupdate, true)
    } catch (e) {
      log.error('Error saving profile', e.message, e, { profile, dialogShown: true })
      showErrorDialog(t`Could not save profile. Please try again.`)
    } finally {
      setSaving(false)
    }
  }, [validate, profile, setSaving, storedProfile, showErrorDialog, userStorage])

  useEffect(() => {
    setProfile(storedProfile)
  }, [storedProfile, setProfile])

  // Validate after saving profile state in order to show errors
  useEffect(() => {
    validate()
  }, [profile, validate])

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
      marginBottom: theme.paddings.bottomPadding,
    },
  }
}

export default withStyles(getStylesFromProps)(EditProfile)
