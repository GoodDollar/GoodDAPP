// @flow
export const getFlexStylesFromProps = props => {
  const { justifyContent, alignItems, grow } = props
  const flex = Number.isFinite(grow) ? grow : grow ? 1 : undefined

  let styles = {}
  if (justifyContent) {
    styles.justifyContent = justifyContent
  }
  if (alignItems) {
    styles.alignItems = alignItems
  }
  if (flex) {
    styles.flex = flex
  }
  return styles
}
