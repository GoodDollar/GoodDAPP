import React from 'react'
import { View } from 'react-native'
import { theme } from '../../theme/styles'

// import ModalLeftBorder from '../modal/ModalLeftBorder'
import ModalContents from '../modal/ModalContents'
import ModalContainer from '../modal/ModalContainer'
import { Section } from '../index'
import { getShadowStyles } from '../../../lib/utils/getStyles'

export const CategoryBox = ({ style, primarycolor, children, title, contentStyle }) => {
  return (
    <ModalContainer style={[styles.box, styles.shadow, style]} fullHeight>
      {/* <ModalLeftBorder borderColor={primarycolor} /> */}
      <ModalContents style={[styles.content, contentStyle]}>
        {title && (
          <>
            <View style={styles.contentWrapper}>
              <Section.Row style={styles.categoryImage}>{children}</Section.Row>
              <Section.Row>
                <Section.Text
                  style={{
                    textTransform: 'capitalize',
                    width: '100%',
                    minWidth: 'max-content',
                    paddingTop: theme.paddings.defaultMargin,
                  }}
                  color={primarycolor}
                  fontSize={12}
                  textAlign={'center'}
                  lineHeight={14}
                  fontFamily="Roboto"
                >
                  {title}
                </Section.Text>
              </Section.Row>
            </View>
            {/* <Section.Separator style={{ marginTop: 4 }} width={1} color={primarycolor} /> */}
          </>
        )}
      </ModalContents>
    </ModalContainer>
  )
}

const styles = {
  content: {
    // paddingTop: theme.paddings.defaultMargin * 2,
    // paddingLeft: theme.paddings.defaultMargin * 2,
    // paddingRight: theme.paddings.defaultMargin * 2,
    // paddingBottom: theme.paddings.defaultMargin * 2,
    // borderTopRightRadius: 10,
    // borderBottomRightRadius: 10,
  },
  contentWrapper: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
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
  border: {
    borderWidth: '2px',
    borderColor: theme.colors.primary,
  },
  categoryImage: {
    // flexGrow: 1,
    // flexShrink: 0,
    // width: '100%',
    // padding: '100px',
    alignSelf: 'center',

    // maxHeight: '37.2px',
    // maxWidth: '45.2px',
  },
}
