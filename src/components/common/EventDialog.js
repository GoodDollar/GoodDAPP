// @flow
import React from 'react'
import { View } from 'react-native'
import { Portal, Dialog, Paragraph, Text } from 'react-native-paper'
import CustomButton from './CustomButton'
import type { TransactionEvent } from '../../lib/gundb/UserStorage'
import Avatar from './Avatar'
import Section from './Section'
import { BigGoodDollar } from '../common'
export type EventDialogProps = {
  visible: boolean,
  event: TransactionEvent,
  onDismiss?: () => void
}
const EventDialog = ({ visible, event, onDismiss }: EventDialogProps) => {
  const {
    date,
    type,
    data: { amount, sender, reason }
  } = event

  const dateOptions = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }

  const customDate = new Date(date).toLocaleString(navigator.language, dateOptions)

  const action = type === 'withdraw' ? 'Received' : 'Sent'

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={true}>
        <Dialog.Content>
          <Paragraph style={{ color: '#888888', fontSize: '0.7em' }}>{customDate}</Paragraph>
          <Section
            style={{
              backgroundColor: '#fff',
              fontWeight: 'bold',
              fontSize: '1.5em',
              paddingTop: '1em',
              paddingBottom: '0'
            }}
          >
            <Section.Row>
              <Text style={{ color: '#555', fontSize: '1.2em' }}>{action} GD</Text>
              <Text style={{ color: '#555', fontSize: '1em' }}>
                + <BigGoodDollar number={amount} />
              </Text>
            </Section.Row>
          </Section>
          <View
            style={{
              borderBottom: '1px solid #333',
              borderTop: '1px solid #333'
            }}
          >
            <Section style={{ backgroundColor: '#fff', marginBottom: '0' }}>
              <Section.Row>
                <Avatar style={{ backgroundColor: '#777' }} />
                <Text style={{ color: '#555' }}>From: {sender}</Text>
              </Section.Row>
            </Section>
          </View>
          <Paragraph style={{ fontStyle: 'italic' }}>{reason || 'no reason'}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <CustomButton mode="contained" onPress={onDismiss}>
            Ok
          </CustomButton>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

export default EventDialog
