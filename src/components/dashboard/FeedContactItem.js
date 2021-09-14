import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { map } from 'lodash'
import { Section } from '../common'
import Avatar from '../common/view/Avatar'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import useOnPress from '../../lib/hooks/useOnPress'

const FeedContactItem = ({ contact, selectContact, horizontalMode, styles, index }) => {
  const [phoneNumber] = map(contact.phoneNumbers, 'number')
  const fullName = contact.familyName ? `${contact.givenName} ${contact.familyName}` : contact.givenName
  const handleContact = useOnPress(() => selectContact({ fullName, phoneNumber }), [
    fullName,
    phoneNumber,
    selectContact,
  ])

  return (
    <TouchableOpacity onPress={handleContact}>
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

export default withStyles(({ theme, index }) => ({
  contactWrapperHorizontal: {
    alignItems: 'center',
    paddingHorizontal: 0,
    minWidth: '22%',
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
