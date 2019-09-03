import React, { useRef } from 'react'

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

const InputFile = props => {
  const inputRef = useRef()
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        name="file"
        style={styles.input}
        onChange={async event => {
          event.stopPropagation()
          const [file] = inputRef.current.files
          const dataUrl = await toBase64(file)
          console.info({ file, dataUrl })
          props.onChange(dataUrl)
        }}
      />
      <label htmlFor="file" style={styles.label}>
        {props.children}
      </label>
    </>
  )
}

const styles = {
  input: {
    opacity: 0,
  },
  label: {
    display: 'inline-block',
    cursor: 'pointer',
  },
}
export default InputFile
