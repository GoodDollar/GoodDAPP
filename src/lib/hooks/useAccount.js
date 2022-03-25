import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/userContext'
import { defaultAccountValue, defaultVerificationState } from '../constants/user'

export const useAccount = () => {
  const [accountData, setAccountData] = useState(defaultAccountValue)
  const [verification, setVerification] = useState(defaultVerificationState)
  const [uploadedAvatar, setUploadedAvatar] = useState()

  const {
    account: accountContext,
    verification: verificationContext,
    uploadedAvatar: uploadedAvatarContext,
  } = useContext(UserContext)

  useEffect(() => {
    setAccountData(accountContext)
  }, [accountContext])

  useEffect(() => {
    setVerification(verificationContext)
  }, [verificationContext])

  useEffect(() => {
    setUploadedAvatar(uploadedAvatarContext)
  }, [uploadedAvatarContext])

  return { accountData, verification, uploadedAvatar }
}
