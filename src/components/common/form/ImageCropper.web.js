import React, { useRef } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import './ImageCropper.css'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'

const ImageCropper = props => {
  const cropper = useRef()
  const { image, onChange } = props
  return (
    <Cropper
      ref={cropper}
      src={image}
      style={{ height: getDesignRelativeHeight(400), width: '100%' }}
      dragMode="move"
      aspectRatio={1}
      guides={false}
      autoCropArea={1}
      restore={false}
      highlight={false}
      center={false}
      cropBoxMovable={false}
      cropBoxResizable={false}
      toggleDragModeOnDblclick={false}
      crop={() => {
        const dataUrl = cropper.current.getCroppedCanvas().toDataURL()
        if (image !== dataUrl) {
          onChange(dataUrl)
        }
      }}
    />
  )
}

export default ImageCropper
