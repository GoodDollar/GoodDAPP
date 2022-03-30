import React from 'react'
import { Text } from 'react-native'

import { t } from '@lingui/macro'
import IconWrapper from '../modal/IconWrapper'
import LoadingIcon from '../modal/LoadingIcon'

import normalizeText from '../../../lib/utils/normalizeText'
import { theme } from '../../theme/styles'
import ExplanationDialog from './ExplanationDialog'

const TrashIcon = () => <IconWrapper iconName="trash" color={theme.colors.error} size={50} />

const MessageTextComponent = () => (
  <Text style={{ color: theme.colors.error, fontSize: normalizeText(18) }}>
    {t`If you delete your account`}
    {'\n'}
    <Text style={{ fontWeight: 'bold' }}>{t`you might lose access to your G$!`}</Text>
  </Text>
)

const DeleteAccountDialog = ({ icon = 'trash' }) => (
  <ExplanationDialog
    image={icon === 'trash' ? TrashIcon : LoadingIcon}
    label={<MessageTextComponent />}
    text={t`For security reasons, it might take up to 48 hours for your data to be completely removed.`}
    textStyle={{
      fontSize: normalizeText(16),
      color: theme.colors.lighterGray,
      lineHeight: normalizeText(18),
      textAlign: 'center',
    }}
    labelStyle={{ textAlign: 'center', lineHeight: normalizeText(18) }}
  />
)

export default DeleteAccountDialog
