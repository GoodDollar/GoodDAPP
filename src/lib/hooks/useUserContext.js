import { useContext } from 'react'
import { UserContext } from '../contexts/userContext'

const useUserContext = () => useContext(UserContext)

export default useUserContext
