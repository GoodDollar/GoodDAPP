// @flow
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { CustomButton, Section, Wrapper } from '../common'

import ImageCropper from '../common/form/ImageCropper'

const TITLE = 'Edit Avatar'

const EditAvatar = ({ screenProps, theme }) => {
  const store = GDStore.useStore()
  const wrappedUserStorage = useWrappedUserStorage()
  const profile = store.get('profile')
  const [showErrorDialog] = useErrorDialog()
  const [avatar, setAvatar] = useState()
  const [changed, setChanged] = useState(false)
  const [saving, setSaving] = useState(false)

  const saveAvatar = () => {
    setSaving(true)

    wrappedUserStorage.setProfileField('avatar', avatar, 'public').catch(e => showErrorDialog('Saving image failed', e))

    setSaving(false)
    screenProps.pop()
  }

  const handleAvatarChange = avatar => {
    setAvatar(avatar)
    setChanged(true)
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row>
          <ImageCropper image={profile.avatar} onChange={handleAvatarChange} />
        </Section.Row>
        <Section.Stack justifyContent="flex-end" grow>
          <CustomButton
            disabled={!changed || saving}
            loading={saving}
            onPress={saveAvatar}
            color={theme.colors.darkBlue}
          >
            Save
          </CustomButton>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

EditAvatar.navigationOptions = {
  title: TITLE,
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
    flex: 1,
  },
})

export default withTheme(EditAvatar)
