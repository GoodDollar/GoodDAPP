import React from 'react'
import { View } from 'react-native'
import { theme } from '../../theme/styles'

import ModalContents from '../modal/ModalContents'
import ModalContainer from '../modal/ModalContainer'
import { Section } from '../index'
import { getShadowStyles } from '../../../lib/utils/getStyles'

export const CategoryBox = ({ style, primaryColor, children, title, contentStyle }) => (
  <ModalContainer style={[styles.box, styles.shadow, style]} fullHeight>
    <ModalContents style={[styles.content, contentStyle]}>
      {title && (
        <>
          <View>
            <Section.Row style={styles.categoryImage}>{children}</Section.Row>
            <Section.Row>
              <Section.Text
                style={{
                  textTransform: 'capitalize',
                  width: '100%',

                  // minWidth: 'max-content',
                  paddingTop: theme.paddings.defaultMargin,
                }}
                color={primaryColor}
                fontSize={12}
                textAlign={'center'}
                lineHeight={14}
                fontFamily="Roboto"
              >
                {title}
              </Section.Text>
            </Section.Row>
          </View>
        </>
      )}
    </ModalContents>
  </ModalContainer>
)

const styles = {
  content: {
    justifyContent: 'center',
  },
  shadow: getShadowStyles('0px 2px 4px #00000029', {
    shadowColor: '#00000029',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  }),
  box: {
    flex: 1,
    borderRadius: 10,
  },
  categoryImage: {
    alignSelf: 'center',
  },
}
