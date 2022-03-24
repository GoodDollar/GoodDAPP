import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/userContext'
import { defaultAccountValue } from '../constants/user'

export const useAccount = () => {
  const [accountData, setAccountData] = useState(defaultAccountValue)

  const { account: accountContext } = useContext(UserContext)

  useEffect(() => {
    setAccountData(accountContext)
  }, [accountContext])

  return accountData
}
