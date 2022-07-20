// utils
import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../../lib/utils/sizes'
import normalize from '../../../../lib/utils/normalizeText'
import { withStyles } from '../../../../lib/styles'
import { isBrowser } from '../../../../lib/utils/platform'

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },

  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },

  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
    alignItems: 'center',
  },
  descriptionContainerB: {
    paddingVertical: getDesignRelativeHeight(isBrowser ? 12 : 10),
  },
  descriptionWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  text: {
    textAlign: 'center',
    fontSize: normalize(isLargeDevice ? 22 : 20),
    lineHeight: isLargeDevice ? 36 : 34,
  },

  infoRow: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  action: {
    width: '100%',
  },
  actionsSpace: {
    marginBottom: getDesignRelativeHeight(16),
  },
})

export default withStyles(getStylesFromProps)
