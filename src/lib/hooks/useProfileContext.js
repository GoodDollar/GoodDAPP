import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/userContext'
import { defaultUserState } from '../constants/user'

export const useProfileContext = () => {
  const [userState, setUserState] = useState(defaultUserState)

  const { userState: userStateContext, updateUserState } = useContext(UserContext)

  useEffect(() => {
    setUserState(userStateContext)
  }, [userStateContext])

  return { userState, updateUserState }
}
