import React from 'react'
import './blurFx.css'

const Blurred = props => (
  <div style={props.style} className={props.blur ? 'blurFx' : ''}>
    {props.children}
  </div>
)

export default Blurred
