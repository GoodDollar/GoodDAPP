// @flow
import React, { useState } from 'react'
import { StyleSheet } from 'react-native-web'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { CustomButton, Section, UserAvatar, Wrapper } from '../common'

const TITLE = 'Edit Avatar'

const EditAvatar = props => {
  const store = GDStore.useStore()
  const wrappedUserStorage = useWrappedUserStorage()
  const profile = store.get('profile')
  const [showErrorDialog] = useErrorDialog()
  const [avatar, setAvatar] = useState()
  const [changed, setChanged] = useState(false)
  const [saving, setSaving] = useState(false)

  const saveAvatar = async () => {
    setSaving(true)

    await wrappedUserStorage.setProfileField('avatar', avatar, 'public').catch(showErrorDialog)

    setSaving(false)

    props.screenProps.pop()
  }

  const handleAvatarChange = avatar => {
    setAvatar(avatar)
    setChanged(true)
  }

  const handleAvatarClose = () => {
    setAvatar(null)
    setChanged(true)
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <UserAvatar onChange={handleAvatarChange} onClose={handleAvatarClose} editable={true} profile={profile} />
        </Section.Row>
        <Section.Row style={styles.centered}>
          <CustomButton disabled={!changed || saving} loading={saving} mode="outlined" onPress={saveAvatar}>
            Save
          </CustomButton>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

EditAvatar.navigationOptions = {
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
  }
})

export default EditAvatar
