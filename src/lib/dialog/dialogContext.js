//@flow
import React, { createContext, useState } from 'react'

export type DialogData = {
  visible: boolean,
  title?: string,
  message?: string,
}

export const DialogContext = createContext({ dialogData: { visible: false } })
export const DialogContextProvider = props => {
  const [dialogData, setDialog] = useState<DialogData>({ visible: false })

  return (
    <DialogContext.Provider
      value={{
        dialogData,
        setDialog,
      }}
    >
      {props.children}
    </DialogContext.Provider>
  )
}
