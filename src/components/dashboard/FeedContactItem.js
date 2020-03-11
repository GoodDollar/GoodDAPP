import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Avatar, Section } from '../common'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'

const FeedContactItem = ({ contact, selectContact, horizontalMode, styles }) => {
  const phoneNumber = contact.phoneNumbers[0] && contact.phoneNumbers[0].number
  const fullName = `${contact.givenName} ${contact.familyName}`

  return (
    <TouchableOpacity onPress={() => selectContact(fullName, phoneNumber)}>
      <Section.Row key={contact.recordId} style={!horizontalMode && styles.contactWrapperVertical}>
        <Section style={horizontalMode ? styles.contactWrapperHorizontal : styles.rowSpace}>
          <Avatar
            size={normalize(34)}
            source={contact.hasThumbnail && contact.thumbnailPath}
            style={horizontalMode && styles.avatarSpace}
          />
          <Text style={!horizontalMode && styles.name}>
            {horizontalMode ? contact.givenName || contact.familyName : fullName}
          </Text>
        </Section>
        {!horizontalMode && <Text>{phoneNumber}</Text>}
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  name: {
    marginLeft: 10,
  },
  avatarSpace: {
    marginBottom: 4,
  },
}))(FeedContactItem)
