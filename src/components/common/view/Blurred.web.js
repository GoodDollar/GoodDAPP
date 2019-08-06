import React from 'react'

const Blurred = props => (
  <div style={props.style} className={props.blur ? 'blurFx' : ''}>
    {props.children}
  </div>
)

export default Blurred
