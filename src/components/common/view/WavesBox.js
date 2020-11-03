import React from 'react'
import { theme } from '../../theme/styles'
import ModalLeftBorder from '../modal/ModalLeftBorder'
import ModalContents from '../modal/ModalContents'
import ModalContainer from '../modal/ModalContainer'
import { Section } from '../index'

export const WavesBox = ({ style, primaryColor, children, title, contentStyle }) => {
  return (
    <ModalContainer style={[styles.box, style]} fullHeight>
      <ModalLeftBorder borderColor={primaryColor} />
      <ModalContents style={[styles.content, contentStyle]}>
        {title && (
          <Section.Row>
            <Section.Text
              style={{ textTransform: 'capitalize' }}
              color={primaryColor}
              fontWeight={'bold'}
              fontSize={18}
              letterSpacing={0.09}
            >
              {title}
            </Section.Text>
          </Section.Row>
        )}
        <Section.Separator style={{ marginTop: 4 }} width={1} color={primaryColor} />
        {children}
      </ModalContents>
    </ModalContainer>
  )
}

const styles = {
  content: {
    paddingTop: theme.paddings.defaultMargin,
    paddingLeft: theme.paddings.defaultMargin * 1.5,
    paddingRight: theme.paddings.defaultMargin * 1.5,
    paddingBottom: theme.paddings.defaultMargin * 2,
  },
  box: {
    flex: 1,
    borderRadius: 10,
    boxShadow: '0 2px 4px #00000029',
  },
}
