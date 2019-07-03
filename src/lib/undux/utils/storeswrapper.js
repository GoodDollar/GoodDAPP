import React from 'react'
import GDStore from '../GDStore'
import SimpleStore from '../SimpleStore'

export const StoresWrapper = ({ children }) => {
  return (
    <GDStore.Container>
      <SimpleStore.Container>{children}</SimpleStore.Container>
    </GDStore.Container>
  )
}
