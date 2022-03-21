import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, PermissionsAndroid } from 'react-native'
import { promisify } from 'es6-promisify'
import contacts from 'react-native-contacts'
import { map, memoize, orderBy, uniq } from 'lodash'
import logger from '../../lib/logger/js-logger'
import { isAndroid } from '../../lib/utils/platform'
import { Section } from '../common'
import InputText from '../common/form/InputWithAdornment'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import FeedContactItem from './FeedContactItem'
import ItemSeparator from './ItemSeparator'

const Contacts = promisify(contacts.getAll)
const log = logger.child({ from: 'Who' })

const WhoContent = ({ styles, setContact, error, text, value, next, state, showNext, setValue }) => {
  const userStorage = useUserStorage()
  const [contacts, setContacts] = useState([])
  const [recentFeedItems, setRecentFeedItems] = useState([])
  const [recentlyUsedList, setRecentlyUsedList] = useState([])
  const initialList = useRef()
  const inputRef = useRef()

  const getUserFeed = async () => {
    const userFeed = await userStorage.getFeedPage(20, true)
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
          log.info('permissions denied')
        } else {
          const sortContacts = orderBy(contacts, ['givenName'])
          setContacts(sortContacts)
          initialList.current = sortContacts
        }
      })
    }
  }, [])

  const filterContacts = useCallback(
    memoize(searchQuery => {
      const allContacts = initialList.current || []
      const query = searchQuery.toLocaleLowerCase()

      return allContacts.filter(({ givenName, familyName, phoneNumbers }) => {
        const [phoneNumber] = map(phoneNumbers, 'number')

        return [givenName, familyName, phoneNumber].some(field => (field || '').toLocaleLowerCase().includes(query))
      })
    }),
    [],
  )

  const isStateEmpty = !state

  const setFocus = () => inputRef.current.focus()

  const handleSearch = useCallback(
    query => {
      if (!isStateEmpty) {
        setValue(query)
      }

      setContacts(filterContacts(query))
    },
    [setContacts, setValue, filterContacts, isStateEmpty],
  )

  useEffect(() => {
    if (contacts.length === 0) {
      showNext(true)
    } else {
      showNext(false)
    }
  }, [contacts])

  useEffect(() => {
    let matches = []
    if (recentFeedItems.length > 0 && contacts.length > 0) {
      recentFeedItems.forEach(feedItem => {
        matches.push(
          contacts.filter(({ phoneNumbers }) => {
            const [contactNumber] = map(phoneNumbers, 'number')
            const { phoneNumber } = feedItem.data
            return contactNumber && phoneNumber === contactNumber
          }),
        )
      })
    }

    const recentlyContacts = uniq(matches.flat())

    setRecentlyUsedList(recentlyContacts)
  }, [contacts, recentFeedItems])

  const getItemRenderer = useCallback(
    memoize((mode = 'verticalMode') => ({ item, index }) => {
      return (
        <FeedContactItem
          contact={item}
          selectContact={setContact}
          horizontalMode={mode === 'horizontalMode'}
          index={index}
        />
      )
    }),
    [setContact],
  )

  return (
    <>
      <Section.Stack justifyContent="space-around" style={styles.container}>
        <Section.Title fontWeight="medium">{text}</Section.Title>
        <InputText
          showAdornment
          error={error}
          onChangeText={handleSearch}
          placeholder="Search contact name / phone"
          value={value}
          enablesReturnKeyAutomatically
          adornment="search"
          adornmentSize={28}
          adornmentStyle={styles.iconPosition}
          adornmentColor={styles.adornmentColor}
          adornmentAction={setFocus}
          getRef={inputRef}
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
              renderItem={getItemRenderer('horizontalMode')}
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
            <FlatList
              data={contacts}
              renderItem={getItemRenderer('verticalMode')}
              ItemSeparatorComponent={ItemSeparator}
            />
          </Section.Stack>
        </>
      )}
    </>
  )
}

export default withStyles(({ theme }) => ({
  adornmentColor: theme.colors.gray50Percent,
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
  iconPosition: {
    bottom: 3,
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
