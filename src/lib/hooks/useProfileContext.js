import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/userContext'
import { defaultUserState } from '../constants/user'

export const useProfileContext = () => {
  const [userState, setUserState] = useState(defaultUserState)

  const context = useContext(UserContext)

  const { userState: userStateContext, updateUserState, resetUserContext } = context

  useEffect(() => {
    setUserState(userStateContext)
  }, [userStateContext])

  return { userState, updateUserState, resetUserContext }
}
