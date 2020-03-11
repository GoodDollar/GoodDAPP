import React, { useCallback, useEffect } from 'react'
import { FlatList, PermissionsAndroid } from 'react-native'
import Contacts from 'react-native-contacts'
import { isAndroid } from '../../lib/utils/platform'
import { Section } from '../common'
import Separator from '../common/layout/Separator'
import InputText from '../common/form/InputText'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import FeedContactItem from './FeedContactItem'

const WhoContent = ({ contacts, styles, setValue, error, text, value, next, state, setContacts }) => {
  const getAllContacts = () => {
    Contacts.getAll((err, contacts) => {
      if (err === 'denied') {
        console.warn('permissions denied')
      } else {
        setContacts(contacts)
      }
    })
  }

  const showPermissionsAndroid = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      title: 'Contacts',
      message: 'This app would like to view your contacts.',
      buttonPositive: 'Please accept bare mortal',
    }).then(() => {
      getAllContacts()
    })
  }

  useEffect(() => {
    if (Contacts) {
      if (isAndroid) {
        showPermissionsAndroid()
      } else {
        getAllContacts()
      }
    }
  }, [])

  const handleSearch = useCallback(query => {
    const queryIsNumber = parseInt(query)
    if (state) {
      setValue(query)
    }
    if (query && !query.includes('+') && !query.includes('*')) {
      if (typeof queryIsNumber === 'number' && !isNaN(queryIsNumber)) {
        return setContacts(
          contacts.filter(({ phoneNumbers }) =>
            new RegExp(`^(.*(${query}).*)$`, 'gmi').test(phoneNumbers[0] && phoneNumbers[0].number)
          )
        )
      }
      if (typeof query === 'string') {
        return setContacts(
          contacts.filter(({ givenName, familyName }) => {
            const fullName = `${givenName} ${familyName}`
            return new RegExp(`^(.*(${query}).*)$`, 'gmi').test(fullName)
          })
        )
      }
    } else {
      return getAllContacts()
    }
  })

  return (
    <>
      <Section.Stack justifyContent="space-around" style={styles.container}>
        <Section.Title fontWeight="medium">{text}</Section.Title>
        <InputText
          error={error}
          onChangeText={handleSearch}
          placeholder="Search contact name / phone"
          style={styles.input}
          value={value}
          enablesReturnKeyAutomatically
          onSubmitEditing={next}
          iconName="search"
        />
      </Section.Stack>
      <Section.Row justifyContent="space-between">
        <Section.Title fontWeight="medium" style={styles.sectionTitle}>
          {'Recently used'}
        </Section.Title>
        <Section.Separator style={styles.separator} width={1} />
      </Section.Row>
      <Section.Row>
        {contacts && (
          <FlatList
            data={contacts && contacts.slice(0, 5)}
            renderItem={({ item, index }) => <FeedContactItem contact={item} selectContact={setValue} horizontalMode />}
            ItemSeparatorComponent={() => <Separator color={styles.separatorColor} />}
            horizontal
            contentContainerStyle={styles.recentlyUserContainer}
          />
        )}
      </Section.Row>
      <Section.Row justifyContent="space-between">
        <Section.Title fontWeight="medium" style={styles.sectionTitle}>
          {'Choose a Contact'}
        </Section.Title>
        <Section.Separator style={styles.separator} width={1} />
      </Section.Row>
      <Section.Stack style={styles.bottomSpace}>
        {contacts && (
          <FlatList
            data={contacts}
            renderItem={({ item, index }) => <FeedContactItem contact={item} selectContact={setValue} />}
            ItemSeparatorComponent={() => <Separator color={styles.separatorColor} />}
          />
        )}
      </Section.Stack>
    </>
  )
}

export default withStyles(({ theme }) => ({
  separatorColor: theme.colors.gray50Percent,
  sectionTitle: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    paddingRight: 10,
  },
  separator: {
    flex: 1,
    opacity: 0.3,
  },
  recentlyUserContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bottomSpace: {
    marginBottom: 20,
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
}))(WhoContent)
