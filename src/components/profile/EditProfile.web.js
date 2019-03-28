import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Wrapper, Section, CustomButton, UserAvatar } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'

import ProfileDataTable from './ProfileDataTable'

const log = logger.child({ from: 'Edit Profile' })

const EditProfile = props => {
  const store = GDStore.useStore()
  const userStorage = useWrappedUserStorage()

  const [profile, setProfile] = useState(store.get('profile'))
  const [saving, setSaving] = useState()
  const [errors, setErrors] = useState({})
  const { loading } = store.get('currentScreen')
  useEffect(() => {
    userStorage.getPrivateProfile(profile).then(setProfile)
  }, [profile.fullName])

  const handleSaveButton = async () => {
    const { isValid, errors } = profile.validate()
    setErrors(errors)
    if (!isValid) return

    setSaving(true)
    await userStorage.setProfile(profile)
    setSaving(false)
  }
  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <UserAvatar profile={profile} editable onChange={setProfile} />
          <CustomButton
            disabled={loading}
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
