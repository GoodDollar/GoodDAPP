import React from 'react'
import { Linking, Text, TouchableOpacity, View } from 'react-native'

import { t } from '@lingui/macro'
import IconWrapper from '../modal/IconWrapper'
import LoadingIcon from '../modal/LoadingIcon'

import config from '../../../config/config'
import normalizeText from '../../../lib/utils/normalizeText'
import { theme } from '../../theme/styles'
import ExplanationDialog from './ExplanationDialog'

const TrashIcon = () => <IconWrapper iconName="trash" color={theme.colors.error} size={50} />

const MessageTextComponent = () => (
  <Text style={{ color: theme.colors.error, fontSize: normalizeText(18) }}>
    {t`If you delete your account`}
    {`\n`}
    <Text style={{ fontWeight: 'bold' }}>{t`you might lose access to your G$!`}</Text>
  </Text>
)

const IdentityTextComponent = ({ expiryDate }) => {
  return (
    <View>
      <Text
        style={{
          color: theme.colors.darkGray,
          fontSize: normalizeText(16),
          alignSelf: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {t`To prevent fraud, you will not be able to verify another wallet until this wallet address verification expires on: ${expiryDate}`}
        {`\n`}
        {`\n`}
        {t`If you wish to continue claiming with another wallet you can either export this wallet private key or connect another wallet to your identity by following the guide under 'Learn More'`}
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL(config.faceVerificationConnectGuide)}>
        <Text
          style={{
            color: theme.colors.lightBlue,
            fontSize: normalizeText(18),
            alignSelf: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            textDecoration: 'underline',
          }}
        >{t`Learn More`}</Text>
      </TouchableOpacity>
    </View>
  )
}
const DeleteAccountDialog = ({ icon = 'trash', expiryDate }) => (
  <ExplanationDialog
    image={icon === 'trash' ? TrashIcon : LoadingIcon}
    label={<MessageTextComponent />}
    textStyle={{
      fontSize: normalizeText(16),
      color: theme.colors.lighterGray,
      lineHeight: normalizeText(18),
      textAlign: 'center',
    }}
    labelStyle={{ textAlign: 'center', lineHeight: normalizeText(18) }}
  >
    <IdentityTextComponent expiryDate={expiryDate} />
  </ExplanationDialog>
)

export default DeleteAccountDialog
