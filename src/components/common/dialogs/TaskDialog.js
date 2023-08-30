import React from 'react'
import { Platform, View } from 'react-native'
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
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      paddingTop: 60,
      marginTop: 20,
      ...Platform.select({
        web: {
          maxWidth: 'fit-content',
          boxShadow: theme.shadows.shadow2,
        },
        native: {
          shadowColor: 'rgba(0, 0, 0, 1)',
          shadowOffset: { width: 8, height: 1 },
          shadowRadius: 2.22,
          shadowOpacity: 1,
          elevation: 4,
        },
      }),
    },
    taskHeader: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: theme.colors.green,
      width: 210,
      borderRadius: 50,
      ...Platform.select({
        web: {
          top: -20,
          left: 50,
          height: 10,
          padding: 20,
        },
        native: {
          top: -20,
          left: 30,
          height: 40,
        },
      }),
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
          {t`Did you know you can earn more GoodDollars by completing tasks?`}
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
