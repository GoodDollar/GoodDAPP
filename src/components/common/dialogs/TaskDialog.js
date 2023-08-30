import React from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import { useTaskList } from '../../dashboard/Tasks/hooks/useTasks'
import { Section, Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const dialogStyles = ({ theme }) => {
  return {
    subTitleContainer: {
      marginBottom: theme.sizes.defaultDouble,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 25,
    },
    taskContainer: {
      marginBottom: 30,
      backgroundColor: theme.colors.secondaryGray,
      borderRadius: 20,
      maxWidth: 'fit-content',
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      paddingTop: 60,
      marginTop: 20,
      boxShadow: theme.shadows.shadow2,
    },
    taskHeader: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      top: -20,
      left: 50,
      padding: 20,
      backgroundColor: theme.colors.green,
      borderRadius: '50%',
      width: 210,
      height: 10,
    },
    headerText: {
      fontSize: 16,
      color: 'white',
      textTransform: 'uppercase',
      fontFamily: theme.fonts.slab,
    },
    taskBody: {
      flexDirection: 'column',
    },
    taskDesc: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 30,
    },
    taskAction: {
      width: '100%',
    },
  }
}

export default withStyles(dialogStyles)(({ styles, theme }) => {
  const { tasks } = useTaskList()

  return (
    <View>
      <View style={styles.subTitleContainer}>
        <Text color={theme.colors.darkGray} style={styles.subtitle}>
          {t`Did you know you can earn more 
          GoodDollars by completing tasks?`}
        </Text>
      </View>
      <Section style={styles.taskContainer}>
        <Section.Row style={styles.taskHeader}>
          <Section.Text style={styles.headerText}>{t`Next task`}</Section.Text>
        </Section.Row>
        {tasks.map(task => (
          <Section.Row key={task.id} style={styles.taskBody}>
            <Section.Text style={styles.taskDesc}>{task.description}</Section.Text>
            <Section.Text style={styles.taskAction}>{task.actionButton}</Section.Text>
          </Section.Row>
        ))}
      </Section>
    </View>
  )
})
