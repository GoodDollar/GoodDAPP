import React, { useMemo } from 'react'
import { Platform, View } from 'react-native'
import { usePostHog } from 'posthog-react-native'

import { usePosthogClient } from '../../../lib/hooks/usePosthogClient'
import TaskButton from '../../common/buttons/TaskButton'
import { Section, Text } from '../../common'
import { withStyles } from '../../../lib/styles'
import logger from '../../../lib/logger/js-logger'

const log = logger.child({ from: 'Dashboard' })

const dialogStyles = ({ theme }) => ({
  subTitleContainer: {
    marginTop: 16,
    marginBottom: theme.sizes.defaultDouble,
  },
  subtitle: {
    textAlign: 'center',
  },
  taskContainer: {
    marginBottom: 30,
    backgroundColor: theme.colors.secondaryGray,
    borderRadius: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'relative',
    paddingTop: 40,

    marginTop: 20,
    ...Platform.select({
      web: {
        maxWidth: 'fit-content',
        minWidth: '90%',
        paddingTop: 60,
        boxShadow: theme.shadows.shadow2,
      },
      native: {
        shadowColor: 'rgba(0, 0, 0, 1)',
        shadowOffset: { width: 8, height: 1 },
        shadowRadius: 2.22,
        shadowOpacity: 1,
        elevation: 4,
        paddingTop: 40,
      },
    }),
  },
  taskHeader: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.colors.green,

    borderRadius: 50,
    ...Platform.select({
      web: {
        top: -15,
        left: 0,
        right: 0,
        bottom: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        height: 10,
        padding: 16,
        width: 150,
        position: 'absolute',
      },
      native: {
        top: -20,
        left: 80,
        height: 30,
        width: 120,
        paddingLeft: 10,
        paddingRight: 10,
      },
    }),
  },
  headerText: {
    fontSize: 14,
    ...Platform.select({
      web: {
        fontSize: 14,
      },
      native: {
        fontSize: 12,
      },
    }),
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
    ...Platform.select({
      web: {
        width: '100%',
      },
    }),
  },
})

const TaskDialog = ({ styles, theme }) => {
  const posthog = usePosthogClient()
  const posthogReg = usePostHog()
  const payload = useMemo(() => (posthog ? posthog.getFeatureFlagPayload('next-tasks') : []), [posthog])
  const payloadReg = useMemo(() => (posthogReg ? posthogReg.getFeatureFlagPayload('next-tasks') : []), [posthogReg])
  const { tasks } = payload || {}

  log.info('posthogtesting -->', { posthog, posthogReg, payloadReg, payload })

  return (
    <View>
      {tasks
        ?.filter(task => task.enabled)
        .map(task => (
          <>
            <View style={styles.subTitleContainer}>
              {task.taskHeader && (
                <Text color={theme.colors.darkGray} style={styles.subtitle}>
                  {task.taskHeader}
                </Text>
              )}
            </View>
            <Section style={styles.taskContainer}>
              <Section.Row key={task.tag} style={styles.taskBody}>
                <Section.Text style={styles.taskDesc}>{task.description}</Section.Text>
                <Section.Text style={styles.taskAction}>
                  <TaskButton buttonText={task.buttonText} url={task.url} eventTag={task.tag} styles={styles} />
                </Section.Text>
              </Section.Row>
            </Section>
          </>
        ))}
    </View>
  )
}

export default withStyles(dialogStyles)(TaskDialog)
