import React, { useCallback, useEffect } from 'react'
import { FlatList, PermissionsAndroid } from 'react-native'
import { promisify } from 'es6-promisify'
import contacts from 'react-native-contacts'
import { map, memoize, orderBy, uniq } from 'lodash'
import { isAndroid } from '../../lib/utils/platform'
import { Section } from '../common'
import Separator from '../common/layout/Separator'
import InputText from '../common/form/InputText'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import userStorage from '../../lib/gundb/UserStorage'
import FeedContactItem from './FeedContactItem'
const Contacts = promisify(contacts.getAll)

const WhoContent = ({ styles, setContact, error, text, value, next, state, showNext, setValue }) => {
  const [contacts, setContacts] = React.useState([])
  const [initialList, setInitalList] = React.useState(contacts)
  const [recentFeedItems, setRecentFeedItems] = React.useState([])
  const [recentlyUsedList, setRecentlyUsedList] = React.useState([])

  const getUserFeed = async () => {
    const userFeed = await userStorage.getFeedPage(5, true)
    const recent = userFeed.filter(({ type }) => type === 'send' || type === 'receive')
    setRecentFeedItems(recent)
  }

  const showPermissionsAndroid = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      title: 'Contacts',
      message: 'We need access to view your contacts, so you can easily send G$ to them.',
      buttonPositive: 'Approve',
    })
  }

  useEffect(() => {
    getUserFeed()
  }, [])

  useEffect(() => {
    if (Contacts) {
      if (isAndroid) {
        showPermissionsAndroid()
      }
      Contacts().then((contacts, err) => {
        if (err === 'denied') {
          console.warn('permissions denied')
        } else {
          const sortContacts = orderBy(contacts, ['givenName'])
          setContacts(sortContacts)
          setInitalList(sortContacts)
        }
      })
    }
  }, [])

  const filterContacts = useCallback(
    memoize(searchQuery => {
      const query = searchQuery.toLocaleLowerCase()

      return initialList.filter(({ givenName, familyName, phoneNumbers }) => {
        const [phoneNumber] = map(phoneNumbers, 'number')

        return [givenName, familyName, phoneNumber].some(field => (field || '').toLocaleLowerCase().includes(query))
      })
    }),
    [initialList]
  )

  const handleSearch = useCallback(
    query => {
      if (state) {
        setValue(query)
      }

      setContacts(filterContacts(query))
    },
    [setContacts, setValue, filterContacts]
  )

  useEffect(() => {
    if (contacts.length === 0) {
      showNext(true)
    } else {
      showNext(false)
    }
  }, [contacts])

  useEffect(() => {
    findRecentlyUsed()
  }, [contacts, recentFeedItems])

  const findRecentlyUsed = () => {
    let matches = []
    if (recentFeedItems.length > 0 && contacts.length > 0) {
      recentFeedItems.forEach(feedItem => {
        matches.push(
          contacts.filter(({ phoneNumbers }) => {
            const [contactNumber] = map(phoneNumbers, 'number')
            const { phoneNumber } = feedItem.data
            return contactNumber && phoneNumber === contactNumber
          })
        )
      })
    }

    const recentlyContacts = uniq(matches.flat())

    setRecentlyUsedList(recentlyContacts)
  }

  const renderItem = useCallback(
    horizontalMode => ({ item, index }) => {
      return <FeedContactItem contact={item} selectContact={setContact} horizontalMode={horizontalMode} index={index} />
    },
    [setContact]
  )

  const ItemSeparator = () => <Separator color={styles.separatorColor} />

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
              data={recentlyUsedList}
              renderItem={renderItem(true)}
              ItemSeparatorComponent={ItemSeparator}
              horizontal
              contentContainerStyle={styles.recentlyUserContainer}
              scrollEnabled={false}
            />
          </Section.Row>
        </>
      )}
      {contacts.length > 0 && (
        <>
          <Section.Row justifyContent="space-between">
            <Section.Title fontWeight="medium" style={styles.sectionTitle}>
              {'Choose a Contact'}
            </Section.Title>
            <Section.Separator style={styles.separator} width={1} />
          </Section.Row>
          <Section.Stack style={styles.bottomSpace}>
            <FlatList data={contacts} renderItem={renderItem()} ItemSeparatorComponent={ItemSeparator} />
          </Section.Stack>
        </>
      )}
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
    justifyContent: 'flex-start',
  },
  bottomSpace: {
    marginBottom: 20,
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
}))(WhoContent)
