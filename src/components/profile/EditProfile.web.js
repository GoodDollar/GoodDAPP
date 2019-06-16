import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { Wrapper, Section, CustomButton, UserAvatar } from '../common'
import GDStore from '../../lib/undux/GDStore'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'
const log = logger.child({ from: TITLE })

const EditProfile = props => {
  const store = GDStore.useStore()
  const wrappedUserStorage = useWrappedUserStorage()

  const [profile, setProfile] = useState(store.get('profile'))
  const [saving, setSaving] = useState()
  const [errors, setErrors] = useState({})
  useEffect(() => {
    wrappedUserStorage.getPrivateProfile(profile).then(setProfile)
  }, [profile.fullName])

  const handleSaveButton = async () => {
    const { isValid, errors } = profile.validate()
    setErrors(errors)
    if (!isValid) return

    setSaving(true)
    await wrappedUserStorage
      .setProfile(profile)
      .catch(async err => {
        const savedProfile = await userStorage.getPrivateProfile(profile)
        log.error({ err, profile, savedProfile })
        setProfile({ ...savedProfile, username: savedProfile.username || '' })
      })
      .catch(e => log.error(e))
      .finally(r => setSaving(false))
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

EditProfile.navigationOptions = {
  title: TITLE
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
