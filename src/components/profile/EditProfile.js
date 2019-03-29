import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Wrapper, Section, CustomButton, UserAvatar } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../../lib/validators/isMobilePhone'

import ProfileDataTable from './ProfileDataTable'

const log = logger.child({ from: 'Edit Profile' })

const EditProfile = props => {
  const store = GDStore.useStore()
  const userStorage = useWrappedUserStorage()

  const [profile, setProfile] = useState(store.get('profile'))
  const [errors, setErrors] = useState({})
  const { loading: saving } = store.get('currentScreen')
  useEffect(() => {
    userStorage.getPrivateProfile(profile).then(setProfile)
  }, [profile.fullName])

  /**
   * checks errors and returns true if at least one error was found
   */
  const checkErrors = () => {
    const emailErrorMessage = isEmail(profile.email) ? '' : 'Please enter an email in format: yourname@example.com'
    const mobileErrorMessage = isMobilePhone(profile.mobile) ? '' : 'Please enter a valid phone format'

    log.debug({ email: emailErrorMessage, mobile: mobileErrorMessage })
    setErrors({ email: emailErrorMessage, mobile: mobileErrorMessage })
    return !(emailErrorMessage === '' && mobileErrorMessage === '')
  }

  const handleSaveButton = () => {
    if (checkErrors()) return
    Promise.all([
      userStorage.setProfileField('email', profile.email, 'masked'),
      userStorage.setProfileField('mobile', profile.mobile, 'masked')
    ])
  }
  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <UserAvatar onChange={setProfile} editable={true} profile={profile} />
          <CustomButton
            disabled={saving}
            loading={saving}
            mode="outlined"
            style={styles.saveButton}
            onPress={handleSaveButton}
          >
            Save
          </CustomButton>
        </Section.Row>
        <ProfileDataTable onChange={setProfile} editable={true} errors={errors} profile={profile} />
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  saveButton: {
    position: 'absolute',
    top: 0,
    right: 0
  }
})

export default EditProfile
