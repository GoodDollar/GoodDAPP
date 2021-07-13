// @flow
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Dialog, Paragraph, Portal } from 'react-native-paper'
import type { TransactionEvent } from '../../../lib/userStorage/UserStorage'
import { Avatar, BigGoodDollar } from '..'
import CustomButton from '../buttons/CustomButton'
import Section from '../layout/Section'

export type EventDialogProps = {
  visible: boolean,
  event: TransactionEvent,
  reason?: string,
  onDismiss?: () => void,
}

/**
 * EventDialog based on react-native-paper
 * @param {EventDialogProps} props
 * @param {function} [props.onDismiss]
 * @param {boolean} [props.visible]
 * @param {TransactionEvent} [props.event]
 * @param {string} [props.reason]
 * @returns {React.Node}
 */
const EventDialog = ({ visible, event, onDismiss, reason }: EventDialogProps) => {
  const {
    date,
    data: { amount, sender, name },
  } = event

  const dateOptions = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }

  const customDate = new Date(date).toLocaleString(navigator.language, dateOptions)

  const _onDismiss = useCallback(onDismiss)

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={_onDismiss} dismissable={true}>
        <Dialog.Content>
          <Paragraph style={styles.date}>{customDate}</Paragraph>
          <Section style={styles.gdSection}>
            <Section.Row>
              <Section.Text color="gray" fontSize={18} fontWeight="bold">
                Sent G$
              </Section.Text>
              <Section.Text color="gray" fontWeight="bold">
                + <BigGoodDollar number={amount} />
              </Section.Text>
            </Section.Row>
          </Section>
          <View style={styles.senderView}>
            <Section style={styles.senderSection}>
              <Section.Row>
                <Avatar style={styles.avatar} />
                <Section.Text color="gray">
                  <Section.Text color="gray">From: {sender}</Section.Text>
                  <Section.Text color="gray">{`\n${name}`}</Section.Text>
                </Section.Text>
              </Section.Row>
            </Section>
          </View>
          <Paragraph style={styles.italicParagraph}>{reason}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <CustomButton mode="contained" onPress={_onDismiss}>
            Ok
          </CustomButton>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const styles = StyleSheet.create({
  italicParagraph: {
    fontStyle: 'italic',
  },
  avatar: {
    backgroundColor: '#777',
  },
  sender: {
    color: '#555',
  },
  senderSection: {
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  senderView: {
    borderBottomColor: '#333',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  gdSection: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 0,
  },
  date: {
    color: '#888888',
    fontSize: 8.4,
  },
})

export default EventDialog
