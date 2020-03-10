import React from 'react'
import { FlatList } from 'react-native'
import { Section } from '../common'
import Separator from '../common/layout/Separator'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
import FeedContactItem from './FeedContactItem'

const ContactsSearch = ({ contacts, styles, setValue }) => {
  return (
    <>
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
}))(ContactsSearch)
