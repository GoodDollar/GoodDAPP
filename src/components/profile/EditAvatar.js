// @flow
import React, { useState } from 'react'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { CustomButton, UserAvatar, Wrapper } from '../common'

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

    await wrappedUserStorage
      .setProfileField('avatar', avatar, 'public')
      .catch(e => showErrorDialog('Saving image failed', e))

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
      <UserAvatar onChange={handleAvatarChange} onClose={handleAvatarClose} editable={true} profile={profile} />
      <CustomButton disabled={!changed || saving} loading={saving} mode="outlined" onPress={saveAvatar}>
        Save
      </CustomButton>
    </Wrapper>
  )
}

EditAvatar.navigationOptions = {
  title: TITLE,
}

export default EditAvatar
