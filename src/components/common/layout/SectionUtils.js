// @flow
export const getFlexStylesFromProps = props => {
  const { justifyContent, alignItems, grow } = props
  const flexGrow = Number.isFinite(grow) ? grow : grow ? 1 : undefined

  let styles = {}
  if (justifyContent) {
    styles.justifyContent = justifyContent
  }
  if (alignItems) {
    styles.alignItems = alignItems
  }
  if (flexGrow) {
    styles.flexGrow = flexGrow
  }
  return styles
}
