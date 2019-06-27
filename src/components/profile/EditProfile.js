// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native-web'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { CustomButton, Section, UserAvatar, Wrapper } from '../common'
import ProfileDataTable from './ProfileDataTable'

const TITLE = 'Edit Profile'

const EditProfile = props => {
  const store = GDStore.useStore()
  const wrappedUserStorage = useWrappedUserStorage()
  const { screenProps } = props

  const [profile, setProfile] = useState(store.get('profile'))
  const [saving, setSaving] = useState()
  const [errors, setErrors] = useState({})
  const [showErrorDialog] = useErrorDialog()

  useEffect(() => {
    wrappedUserStorage.getPrivateProfile(profile).then(setProfile)
  }, [profile.fullName])

  const handleSaveButton = () => {
    const { isValid, errors } = profile.validate()
    setErrors(errors)
    if (!isValid) {
      return
    }

    setSaving(true)
    wrappedUserStorage
      .setProfile(profile)
      .catch(showErrorDialog)
      .finally(r => {
        setSaving(false)
      })
    screenProps.pop()
  }

  const handleAvatarPress = event => {
    event.preventDefault()
    event.stopPropagation()
    screenProps.push('EditAvatar')
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <UserAvatar profile={profile} onPress={handleAvatarPress} />
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
