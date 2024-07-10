import React from 'react'

const CheckBox = ({ onClick, children }) => (
  <label style={{ marginBottom: 24, display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
    <input type="checkbox" onClick={onClick} style={{ width: 24, height: 24 }} />
    {children}
  </label>
)

export default CheckBox
