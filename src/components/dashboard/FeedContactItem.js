import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Avatar, Section } from '../common'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'

const FeedContactItem = ({ contact, selectContact, horizontalMode, styles }) => {
  const phoneNumber = contact.phoneNumbers[0].number
  const fullName = `${contact.givenName} ${contact.familyName}`

  if (horizontalMode) {
    return (
      <TouchableOpacity onPress={() => selectContact(fullName)}>
        <Section.Row key={contact.recordId}>
          <Section style={styles.contactWrapperHorizontal}>
            <Avatar
              size={normalize(34)}
              source={contact.hasThumbnail && contact.thumbnailPath}
              style={styles.avatarSpace}
            />
            <Text>{contact.givenName || contact.familyName}</Text>
          </Section>
        </Section.Row>
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity onPress={() => selectContact(contact.givenName)}>
      <Section.Row key={contact.recordId} style={styles.contactWrapperVertical}>
        <Section.Row style={styles.rowSpace}>
          <Avatar size={normalize(34)} source={contact.hasThumbnail && contact.thumbnailPath} />
          <Text style={styles.name}>{fullName}</Text>
        </Section.Row>
        <Text>{phoneNumber}</Text>
      </Section.Row>
    </TouchableOpacity>
  )
}

export default withStyles(({ theme }) => ({
  contactWrapperHorizontal: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  contactWrapperVertical: {
    width: '100%',
    justifyContent: 'space-between',
  },
  rowSpace: {
    paddingBottom: 5,
    paddingTop: 5,
  },
  name: {
    marginLeft: 10,
  },
  avatarSpace: {
    marginBottom: 4,
  },
}))(FeedContactItem)
