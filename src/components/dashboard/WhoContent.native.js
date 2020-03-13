import React, { useCallback, useEffect } from 'react'
import { FlatList, PermissionsAndroid } from 'react-native'
import Contacts from 'react-native-contacts'
import { orderBy, uniq } from 'lodash'
import { isAndroid } from '../../lib/utils/platform'
import { Section } from '../common'
import Separator from '../common/layout/Separator'
import InputText from '../common/form/InputText'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import userStorage from '../../lib/gundb/UserStorage'
import FeedContactItem from './FeedContactItem'

const WhoContent = ({ styles, setName, setPhone, error, text, value, next, state, showNext }) => {
  const [contacts, setContacts] = React.useState([])
  const [initialList, setInitalList] = React.useState(contacts)
  const [recentlyUsed, setRecentlyUsed] = React.useState([])
  const [recentlyUsedList, setRecentlyUsedList] = React.useState([])

  const getAllContacts = () => {
    Contacts.getAll((err, contacts) => {
      if (err === 'denied') {
        console.warn('permissions denied')
      } else {
        const sortContacts = orderBy(contacts, ['givenName'])
        setContacts(sortContacts)
        setInitalList(sortContacts)
      }
    })
  }

  const selectContact = async (name, phone) => {
    await setName(name)
    await setPhone(phone)
    return next()
  }

  const getUserFeed = async () => {
    const userFeed = await userStorage.getAllFeed()
    const recent = userFeed.filter(({ type }) => type === 'send' || type === 'receive')
    setRecentlyUsed(recent)
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
    getUserFeed()
  }, [])

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
      setName(query)
    }
    if (query && !query.includes('+') && !query.includes('*')) {
      if (typeof queryIsNumber === 'number' && !isNaN(queryIsNumber)) {
        return setContacts(
          initialList.filter(({ phoneNumbers }) =>
            new RegExp(`^(.*(${query}).*)$`, 'gmi').test(phoneNumbers[0] && phoneNumbers[0].number)
          )
        )
      }
      if (typeof query === 'string') {
        return setContacts(
          initialList.filter(({ givenName, familyName }) => {
            const fullName = `${givenName} ${familyName}`
            return new RegExp(`^(.*(${query}).*)$`, 'gmi').test(fullName)
          })
        )
      }
    } else {
      getAllContacts()
    }
  })

  useEffect(() => {
    if (contacts.length === 0) {
      showNext(true)
    } else {
      showNext(false)
    }
  }, [contacts])

  useEffect(() => {
    findRecentlyUsed()
  }, [contacts, recentlyUsed])

  const findRecentlyUsed = () => {
    let matches = []
    if (recentlyUsed.length > 0 && contacts.length > 0) {
      recentlyUsed.forEach(contact => {
        matches.push(
          contacts.filter(item => item.phoneNumbers[0] && contact.data.phoneNumber === item.phoneNumbers[0].number)
        )
      })
    }

    setRecentlyUsedList(matches.flat())
  }

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
      {recentlyUsedList.length > 0 && (
        <>
          <Section.Row justifyContent="space-between">
            <Section.Title fontWeight="medium" style={styles.sectionTitle}>
              {'Recently used'}
            </Section.Title>
            <Section.Separator style={styles.separator} width={1} />
          </Section.Row>
          <Section.Row>
            <FlatList
              data={uniq(recentlyUsedList).slice(0, 5)}
              renderItem={({ item, index }) => (
                <FeedContactItem contact={item} selectContact={selectContact} horizontalMode index={index} />
              )}
              ItemSeparatorComponent={() => <Separator color={styles.separatorColor} />}
              horizontal
              contentContainerStyle={styles.recentlyUserContainer}
              scrollEnabled={false}
            />
          </Section.Row>
        </>
      )}
      <Section.Row justifyContent="space-between">
        <Section.Title fontWeight="medium" style={styles.sectionTitle}>
          {'Choose a Contact'}
        </Section.Title>
        <Section.Separator style={styles.separator} width={1} />
      </Section.Row>
      <Section.Stack style={styles.bottomSpace}>
        {contacts.length > 0 && (
          <FlatList
            data={contacts}
            renderItem={({ item, index }) => <FeedContactItem contact={item} selectContact={selectContact} />}
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
