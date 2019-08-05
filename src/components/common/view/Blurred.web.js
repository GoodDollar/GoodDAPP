import React from 'react'

const Blurred = props => (
  <div style={fullScreenContainer} className={props.blur ? 'blurFx' : ''}>
    {props.children}
  </div>
)

const fullScreenContainer = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'absolute',
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
}

export default Blurred
