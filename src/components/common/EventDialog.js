// @flow
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Portal, Dialog, Paragraph, Text } from 'react-native-paper'
import CustomButton from './CustomButton'
import type { TransactionEvent } from '../../lib/gundb/UserStorage'
import Section from './Section'
import { BigGoodDollar, Avatar } from '../common'

export type EventDialogProps = {
  visible: boolean,
  event: TransactionEvent,
  reason?: string,
  onDismiss?: () => void
}
const EventDialog = ({ visible, event, onDismiss, reason }: EventDialogProps) => {
  const {
    date,
    type,
    data: { amount, sender, avatar, name }
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

  const action = type === 'withdraw' ? 'Withdrawn' : 'Sent'

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={true}>
        <Dialog.Content>
          <Paragraph style={styles.date}>{customDate}</Paragraph>
          <Section style={styles.gdSection}>
            <Section.Row>
              <Text style={styles.gd}>Sent GD</Text>
              <Text style={styles.amount}>
                + <BigGoodDollar number={amount} />
              </Text>
            </Section.Row>
          </Section>
          <View style={styles.senderView}>
            <Section style={styles.senderSection}>
              <Section.Row>
                <Avatar style={styles.avatar} />
                <Text style={{ color: '#555' }}>
                  <Text style={{ color: '#555' }}>From: {sender}</Text>
                  <Text>{`\n${name}`}</Text>
                </Text>
              </Section.Row>
            </Section>
          </View>
          <Paragraph style={styles.italicParagraph}>{reason}</Paragraph>
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

const styles = StyleSheet.create({
  italicParagraph: {
    fontStyle: 'italic'
  },
  avatar: {
    backgroundColor: '#777'
  },
  sender: {
    color: '#555'
  },
  senderSection: {
    backgroundColor: '#fff',
    marginBottom: '0'
  },
  senderView: {
    borderBottomColor: '#333',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  gd: {
    color: '#555',
    fontSize: '1.2em',
    fontWeight: 'bold'
  },
  amount: {
    color: '#555',
    fontSize: '1em',
    fontWeight: 'bold'
  },
  gdSection: {
    backgroundColor: '#fff',
    paddingTop: '1em',
    paddingBottom: '0'
  },
  date: {
    color: '#888888',
    fontSize: '0.7em'
  }
})

export default EventDialog
