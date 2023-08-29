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
    taskDesc: {
      marginBottom: 10,
    },
    taskAction: {
      //
    },
  }
}

export default withStyles(dialogStyles)(({ styles, theme }) => {
  const { tasks } = useTaskList()

  return (
    <View>
      <View style={styles.subTitleContainer}>
        <Text
          fontSize={22}
          lineHeight={26}
          textAlign="left"
          fontWeight="bold"
          color={theme.colors.darkGray}
          style={styles.title}
        >
          {t`Did you know you can earn more GoodDollars by completing tasks?`}
        </Text>
      </View>
      <Section style={styles.taskContainer}>
        <Section.Row style={styles.taskHeader}>
          <Section.Text>Next task label</Section.Text>
        </Section.Row>
        {tasks.map(task => (
          <Section.Row key={task.id} styles={styles.taskBody}>
            <Section.Text styles={styles.taskDesc}>{task.description}</Section.Text>
            <Section.Text styles={styles.taskAction}>{task.actionButton}</Section.Text>
          </Section.Row>
        ))}
      </Section>
    </View>
  )
})
