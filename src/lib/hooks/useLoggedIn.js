import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/userContext'

export const useLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoggedInCitizen, setIsLoggedInCitizen] = useState(false)

  const { isLoggedIn: contextLoggedIn, isLoggedInCitizen: contextLoggedInCitizen } = useContext(UserContext)

  useEffect(() => {
    setIsLoggedIn(contextLoggedIn)
  }, [contextLoggedIn])

  useEffect(() => {
    setIsLoggedInCitizen(contextLoggedInCitizen)
  }, [contextLoggedInCitizen])

  return { isLoggedIn, isLoggedInCitizen }
}
