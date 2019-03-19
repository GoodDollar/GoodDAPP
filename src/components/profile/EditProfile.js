import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Icon } from 'react-native-elements'
import { Wrapper, Avatar, Section } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'

const log = logger.child({ from: 'Profile' })

const EditProfile = props => {
  const profile = GDStore.useStore().get('profile')
  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <Avatar size={120} />
        </Section.Row>
        <Section.Title>{profile.fullName}</Section.Title>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Icon name="email" color="rgb(85, 85, 85)" />
            <Text style={styles.tableRowText}>{profile.email}</Text>
          </View>
          <View style={styles.tableRow}>
            <Icon name="phone" color="rgb(85, 85, 85)" />
            <Text style={styles.tableRowText}>{profile.mobile}</Text>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  table: {
    margin: '3em',
    borderTopStyle: 'solid',
    borderTopColor: '#d2d2d2',
    borderTopWidth: '1px'
  },
  tableRow: {
    paddingBottom: '0.5em',
    paddingTop: '0.5em',
    alignItems: 'flex-end',
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomColor: '#d2d2d2',
    borderBottomWidth: '1px'
  },
  tableRowText: {
    textAlign: 'right',
    flex: 1,
    color: 'rgb(85, 85, 85)',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  }
})

export default EditProfile
