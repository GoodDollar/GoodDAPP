// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { CustomButton, Section } from '../../common'
import ImageCropper from '../../common/form/ImageCropper'
import { withStyles } from '../../../lib/styles'

const Cropper = ({ styles, avatar, justUploaded = false, onCropped, onCancelled }) => {
  // if passed avatar mark as dirty so we save it by default
  const [isDirty, markAsDirty] = useState(justUploaded)
  const [processing, setProcessing] = useState(false)
  const croppedRef = useRef(avatar)

  const updateAvatar = useCallback(async () => {
    setProcessing(true)

    try {
      await Promise.resolve(onCropped(croppedRef.current))
    } finally {
      setProcessing(false)
    }
  }, [onCropped])

  const onCrop = useCallback(
    cropped => {
      croppedRef.current = cropped
      markAsDirty(true)
    },
    [markAsDirty],
  )

  useEffect(() => {
    if (processing) {
      return
    }

    markAsDirty(false)
    croppedRef.current = avatar
  }, [avatar, markAsDirty])

  return (
    <>
      <Section.Row>
        <ImageCropper image={avatar} onChange={onCrop} />
      </Section.Row>
      <Section.Stack justifyContent="flex-end" grow>
        <CustomButton
          style={styles.button}
          disabled={!isDirty || processing}
          loading={processing}
          onPress={updateAvatar}
        >
          {t`Save`}
        </CustomButton>
        <CustomButton disabled={processing} onPress={onCancelled}>
          {t`Cancel`}
        </CustomButton>
      </Section.Stack>
    </>
  )
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em',
    flex: 1,
  },
  button: {
    color: theme.colors.primary,
    marginBottom: '0.5em',
  },
})

export default withStyles(getStylesFromProps)(Cropper)
